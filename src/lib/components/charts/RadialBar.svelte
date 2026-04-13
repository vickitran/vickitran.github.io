<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { colors, type, spacing } from '$lib/chartUtils/theme.js';
	import { createSvg, createDataBox, addA11yTable } from '$lib/chartUtils/utils.js';
	// --- Props ---

	export let data;
	export let source = '';
	export let width = 960;
	export let height = 960;
	// mode: 'fixed' | 'mobile' — controls which dataset is shown
	export let mode = 'fixed';

	const SAGE = colors.sageDark;
	const ROSE = colors.roseDark;
	const AMBER = colors.amber;

	// 280° sweep centred on top — starts at -140° (upper-left), ends at +140° (upper-right)
	// 80° gap sits at the bottom
	const SWEEP = (360 * Math.PI) / 110;
	const START_ANG = 0;
	const END_ANG = SWEEP / 2;

	let container;
	let currentMode = mode;

	onMount(() => {
		draw(currentMode);
	});

	// ─── helpers ────────────────────────────────────────────────────────────────

	// Maps value → angle in the sweep (D3 arc convention: 0=top, clockwise)
	function makeAngSc(maxVal) {
		return d3.scaleLinear().domain([0, maxVal]).range([START_ANG, END_ANG]);
	}

	// Convert [value, radius] to SVG [x, y] using clockwise-from-top convention
	function coord(value, radius, angSc, cx, cy) {
		const a = angSc(value);
		return {
			x: cx + Math.sin(a) * radius,
			y: cy - Math.cos(a) * radius
		};
	}

	function buildData(ds) {
		const nBars = 10;
		const chartRadius = getChartRadius();
		// Sort each group ascending by speed so smallest = innermost, largest = outermost
		const bot5Sorted = [...ds.bot5].sort((a, b) => a.mbps - b.mbps);
		const top5Sorted = [...ds.top5].sort((a, b) => a.mbps - b.mbps);
		return [
			...bot5Sorted.map((d, i) => ({ ...d, color: ROSE, idx: i })),
			...top5Sorted.map((d, i) => ({ ...d, color: SAGE, idx: i + 5 }))
		].map((d) => ({
			...d,
			radius: (chartRadius / nBars) * d.idx + 5
		}));
	}

	function getChartRadius() {
		const TITLE_H = 130;
		const FOOTER_H = 32;
		const L = spacing.marginDefault.left;
		const chartW = width - L * 2;
		const chartH = height - TITLE_H - FOOTER_H - spacing.marginDefault.top;
		return Math.min(chartW / 2, chartH / 2) - 8;
	}

	// ─── draw ────────────────────────────────────────────────────────────────────

	function draw(mode) {
		if (!container || !data) return;
		d3.select(container).selectAll('*').remove();

		const ds = data[mode];
		const bars = buildData(ds);
		const angSc = makeAngSc(ds.maxVal);
		const chartRadius = getChartRadius();
		const nBars = 10;
		const barWidth = chartRadius / nBars - 5;

		const TITLE_H = 130;
		const FOOTER_H = 32;
		const L = spacing.marginDefault.left;

		// Centre of the radial chart
		const cx = width / 2;
		const cy = TITLE_H + (height - TITLE_H - FOOTER_H) / 2;

		const svg = createSvg(container, { width, height, ariaLabel: `${ds.label} — radial bar chart` });

		// ── Title ────────────────────────────────────────────────────────────────

		svg
			.append('text')
			.attr('x', cx)
			.attr('y', 28)
			.attr('text-anchor', 'middle')
			.style('font-family', "'Georgia', serif")
			.style('font-size', `${type.chartTitle}px`)
			.style('fill', colors.ink)
			.text(ds.label);

		svg
			.append('text')
			.attr('x', cx)
			.attr('y', 46)
			.attr('text-anchor', 'middle')
			.style('font-family', type.sans)
			.style('font-size', `${type.footnote}px`)
			.style('fill', colors.warmGray)
			.text(`${ds.unit} · Source: ${source}`);

		// ── Legend ───────────────────────────────────────────────────────────────

		const legendG = svg.append('g').attr('transform', `translate(${L}, 62)`);
		const legendItems = [
			{ label: 'Top 5 fastest', color: SAGE, dashed: false },
			{ label: 'Bottom 5 slowest', color: ROSE, dashed: false },
			{ label: 'Global average', color: AMBER, dashed: true }
		];
		let lx = 0;
		legendItems.forEach((l) => {
			if (l.dashed) {
				legendG
					.append('line')
					.attr('x1', lx)
					.attr('y1', 5)
					.attr('x2', lx + 18)
					.attr('y2', 5)
					.attr('stroke', l.color)
					.attr('stroke-width', 1.5)
					.attr('stroke-dasharray', '5,3');
				legendG
					.append('text')
					.attr('x', lx + 22)
					.attr('y', 9)
					.style('font-size', `${type.footnote}px`)
					.style('fill', colors.warmGray)
					.style('font-family', type.sans)
					.text(l.label);
				lx += 140;
			} else {
				legendG
					.append('rect')
					.attr('x', lx)
					.attr('width', 10)
					.attr('height', 10)
					.attr('rx', 2)
					.attr('fill', l.color);
				legendG
					.append('text')
					.attr('x', lx + 14)
					.attr('y', 9)
					.style('font-size', `${type.footnote}px`)
					.style('fill', colors.warmGray)
					.style('font-family', type.sans)
					.text(l.label);
				lx += l.label.length * 7 + 20;
			}
		});

		// ── Data box ─────────────────────────────────────────────────────────────

		const box = createDataBox(svg, {
			width,
			fields: [
				{ key: 'name', label: 'country' },
				{ key: 'speed', label: 'speed' },
				{ key: 'rank', label: 'rank' },
				{ key: 'vs', label: 'vs global avg' }
			],
			y: 82,
			prompt: 'Tap an arc to explore'
		});

		function showBox(d, color) {
			const diff = (d.mbps - ds.avg).toFixed(1);
			box.show({
				name: d.name,
				speed: `${d.mbps} ${ds.unit}`,
				rank: `#${d.rank} of ${ds.total}`,
				vs: `${diff > 0 ? '+' : ''}${diff} ${ds.unit}`
			}, color);
		}

		function clearBox() {
			box.clear();
		}

		// ── Arc generators ────────────────────────────────────────────────────────

		const arc = d3
			.arc()
			.innerRadius((d) => d.radius)
			.outerRadius((d) => d.radius + barWidth)
			.startAngle(START_ANG)
			.endAngle((d) => angSc(d.mbps));

		const bgArc = d3
			.arc()
			.innerRadius((d) => d.radius)
			.outerRadius((d) => d.radius + barWidth)
			.startAngle(START_ANG)
			.endAngle(END_ANG);

		// ── Guide circles ─────────────────────────────────────────────────────────

		bars.forEach((d) => {
			svg
				.append('circle')
				.attr('cx', cx)
				.attr('cy', cy)
				.attr('r', d.radius + barWidth)
				.attr('fill', 'none')
				.attr('stroke', colors.gridLine)
				.attr('stroke-width', spacing.gridWidth);
		});

		// ── Value-axis tick lines + labels ────────────────────────────────────────

		const angAvg = angSc(ds.avg);
		d3.range(100, ds.maxVal + 1, 100).forEach((t) => {
			const angT = angSc(t);
			const c1 = coord(t, bars[0].radius - 4, angSc, cx, cy);
			const c2 = coord(t, chartRadius + 10, angSc, cx, cy);

			svg
				.append('line')
				.attr('x1', c1.x)
				.attr('y1', c1.y)
				.attr('x2', c2.x)
				.attr('y2', c2.y)
				.attr('stroke', colors.gridLine)
				.attr('stroke-width', spacing.axisWidth);

			// Skip label if too close to average line
			if (Math.abs(angT - angAvg) > 0.18) {
				const ct = coord(t, chartRadius + 22, angSc, cx, cy);
				svg
					.append('text')
					.attr('x', ct.x)
					.attr('y', ct.y + 4)
					.attr('text-anchor', ct.x >= cx ? 'start' : 'end')
					.style('font-size', `${type.footnote}px`)
					.style('fill', colors.warmGray)
					.style('font-family', type.sans)
					.text(`${t} ${ds.unit}`);
			}
		});

		// ── Ghost background arcs ─────────────────────────────────────────────────

		svg
			.append('g')
			.selectAll('path')
			.data(bars)
			.join('path')
			.attr('d', bgArc)
			.attr('transform', `translate(${cx},${cy})`)
			.attr('fill', (d) => d.color)
			.attr('opacity', 0.1);

		// ── Data arcs + labels + interaction ─────────────────────────────────────

		let activeEl = null;

		function reset() {
			arcGs.style('opacity', null);
			clearBox();
			activeEl = null;
		}

		const arcGs = svg
			.selectAll('g.vl-radial-arc')
			.data(bars)
			.join('g')
			.attr('class', 'vl-radial-arc')
			.attr('role', 'button')
			.attr('tabindex', 0)
			.attr('aria-label', (d) => `${d.name}: ${d.mbps} ${ds.unit}, rank ${d.rank} of ${ds.total}`);

		// Coloured arc
		arcGs
			.append('path')
			.attr('d', arc)
			.attr('transform', `translate(${cx},${cy})`)
			.attr('fill', (d) => d.color)
			.attr('opacity', 0.88);

		// Country label at arc START (upper-left)
		arcGs.each(function (d) {
			const midR = d.radius + barWidth / 2;
			const c = coord(0, midR, angSc, cx, cy);
			d3.select(this)
				.append('text')
				.attr('x', c.x - 6)
				.attr('y', c.y + 4)
				.attr('text-anchor', 'end')
				.style('font-size', `${type.axisLabel}px`)
				.style('fill', d.color)
				.style('font-family', type.sans)
				.text(d.display);
		});

		// // Speed value label at arc END
		// arcGs.each(function (d) {
		// 	const midR = d.radius + barWidth / 2;
		// 	const c = coord(d.mbps, midR, angSc, cx, cy);
		// 	const isRight = c.x >= cx;
		// 	d3.select(this)
		// 		.append('text')
		// 		.attr('x', c.x + (isRight ? 8 : -8))
		// 		.attr('y', c.y + 4)
		// 		.attr('text-anchor', isRight ? 'start' : 'end')
		// 		.style('font-size', `${type.axisLabel}px`)
		// 		.style('fill', colors.ink)
		// 		.style('font-family', type.sans)
		// 		.text(d.mbps);
		// });

		// Transparent hit area
		arcGs
			.append('path')
			.attr('d', bgArc)
			.attr('transform', `translate(${cx},${cy})`)
			.attr('fill', 'transparent')
			.style('cursor', 'pointer')
			.on('click.radial touchstart.radial keydown.radial', function (event, d) {
				if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
				if (event.type === 'keydown') event.preventDefault();
				event.stopPropagation();
				const g = this.parentNode;
				if (activeEl === g) {
					arcGs.style('opacity', null);
					clearBox();
					activeEl = null;
				} else {
					activeEl = g;
					arcGs.style('opacity', 0.15);
					d3.select(g).style('opacity', 1);
					showBox(d, d.color);
				}
			});

		// Clear button handler
		box.btnG.on('click.radial touchstart.radial keydown.radial', function (event) {
			if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
			event.stopPropagation();
			reset();
		});

		// Background click clears
		svg.on('click.radial touchstart.radial', () => reset());

		// ── Average reference line ────────────────────────────────────────────────

		const avgC1 = coord(ds.avg, bars[0].radius - 8, angSc, cx, cy);
		const avgC2 = coord(ds.avg, chartRadius + 10, angSc, cx, cy);

		svg
			.append('line')
			.attr('x1', avgC1.x)
			.attr('y1', avgC1.y)
			.attr('x2', avgC2.x)
			.attr('y2', avgC2.y)
			.attr('stroke', AMBER)
			.attr('stroke-width', 1.5)
			.attr('stroke-dasharray', '5,3');

		const avgC = coord(ds.avg, chartRadius + 24, angSc, cx, cy);
		const avgRight = avgC.x >= cx;
		svg
			.append('text')
			.attr('x', avgC.x + (avgRight ? 4 : -4))
			.attr('y', avgC.y + 4)
			.attr('text-anchor', avgRight ? 'start' : 'end')
			.style('font-size', `${type.footnote}px`)
			.style('fill', AMBER)
			.style('font-family', type.sans)
			.text(`avg ${ds.avg} ${ds.unit}`);

		// ── Footer ────────────────────────────────────────────────────────────────

		svg
			.append('text')
			.attr('x', cx)
			.attr('y', height - 8)
			.attr('text-anchor', 'middle')
			.style('font-family', type.sans)
			.style('font-size', `${type.footnote}px`)
			.style('fill', colors.warmGray)
			.text(`Source: ${source} · Victoria Labmayr`);

		// ── A11y table ────────────────────────────────────────────────────────────

		addA11yTable(svg.node(), {
			caption: `${ds.label} — data table`,
			columns: [
				{ key: 'name', label: 'Country' },
				{ key: 'mbps', label: `Speed (${ds.unit})` },
				{ key: 'rank', label: 'Rank' }
			],
			rows: bars.map((d) => ({
				name: d.name,
				mbps: d.mbps,
				rank: `#${d.rank} of ${ds.total}`
			}))
		});
	}

	function switchMode(m) {
		currentMode = m;
		draw(currentMode);
	}
</script>

<div style="position: relative; width: 100%; margin: 3rem 0;">
	<div style="display: flex; gap: 6px; margin-bottom: 12px;">
		<button
			on:click={() => switchMode('fixed')}
			style="
				padding: 5px 14px; font-size: 12px; border-radius: 20px; cursor: pointer;
				font-family: {type.sans}; transition: all .15s;
				background: {currentMode === 'fixed' ? colors.sageDark : 'transparent'};
				border: 0.5px solid {currentMode === 'fixed' ? colors.sageDark : colors.warmGray};
				color: {currentMode === 'fixed' ? colors.canvas : colors.warmGray};
			"
		>
			Fixed broadband
		</button>
		<button
			on:click={() => switchMode('mobile')}
			style="
				padding: 5px 14px; font-size: 12px; border-radius: 20px; cursor: pointer;
				font-family: {type.sans}; transition: all .15s;
				background: {currentMode === 'mobile' ? colors.sageDark : 'transparent'};
				border: 0.5px solid {currentMode === 'mobile' ? colors.sageDark : colors.warmGray};
				color: {currentMode === 'mobile' ? colors.canvas : colors.warmGray};
			"
		>
			Mobile
		</button>
	</div>
	<div bind:this={container} />
</div>
