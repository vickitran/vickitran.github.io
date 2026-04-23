<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { colors, type, spacing } from '$lib/chartUtils/theme.js';
	import { createSvg, addFurniture, addA11yTable, createDataBox } from '$lib/chartUtils/utils.js';

	// --- Props ---
	export let subtitle = 'Mozart performances fell sharply in 2017/18 — the lowest of the decade';
	export let title = 'Day 23 - Seasons: Total Mozart opera performances worldwide, by season';
	export let source = 'Operabase';
	export let width = 960;
	export let height = 480;

	// --- Data ---
	// Counted from Operabase season stats files (stats1213–stats1718)
	// Each row = one production. The 14th pipe-delimited column = number of performances.
	const data = [
		{ season: '2012/13', performances: 2361, productions: 519 },
		{ season: '2013/14', performances: 2404, productions: 491 },
		{ season: '2014/15', performances: 2561, productions: 511 },
		{ season: '2015/16', performances: 2387, productions: 529 },
		{ season: '2016/17', performances: 2404, productions: 504 },
		{ season: '2017/18', performances: 2131, productions: 433 }
	];

	let container;
	onMount(() => {
		draw();
	});

	function draw() {
		if (!container) return;
		d3.select(container).selectAll('*').remove();

		// ── Layout ────────────────────────────────────────────────────────────────
		const TITLE_H = 136; // title + subtitle + databox
		const FOOTER_H = 30;
		const L = spacing.marginDefault.left;
		const R = spacing.marginDefault.right;
		const T = TITLE_H;
		const B = spacing.marginDefault.bottom + FOOTER_H;
		const chartW = width - L - R;
		const chartH = height - T - B;

		const minVal = d3.min(data, (d) => d.performances);
		const maxVal = d3.max(data, (d) => d.performances);

		// ── SVG root ──────────────────────────────────────────────────────────────
		const svg = createSvg(container, {
			width,
			height,
			ariaLabel: `${title} — bar chart`
		});

		// ── Furniture ─────────────────────────────────────────────────────────────
		addFurniture(svg, { width, height, title, subtitle, source });

		// ── DataBox ───────────────────────────────────────────────────────────────
		const box = createDataBox(svg, {
			width,
			fields: [
				{ key: 'season', label: 'SEASON' },
				{ key: 'perfs', label: 'PERFORMANCES' },
				{ key: 'productions', label: 'PRODUCTIONS' },
				{ key: 'perfsPerProd', label: 'PERFS PER PRODUCTION' }
			],
			y: 74,
			prompt: 'Click a bar to explore'
		});

		// ── Scales ────────────────────────────────────────────────────────────────
		const x = d3
			.scaleBand()
			.domain(data.map((d) => d.season))
			.range([0, chartW])
			.padding(0.28);

		const yMin = 1800;
		const yMax = 2700;
		const y = d3.scaleLinear().domain([yMin, yMax]).range([chartH, 0]);

		const yTicks = y.ticks(5);

		// ── Chart group ───────────────────────────────────────────────────────────
		const g = svg.append('g').attr('transform', `translate(${L}, ${T})`);

		// ── Grid lines ────────────────────────────────────────────────────────────
		g.selectAll('.vl-grid')
			.data(yTicks)
			.join('line')
			.attr('class', 'vl-grid')
			.attr('x1', 0)
			.attr('x2', chartW)
			.attr('y1', (d) => y(d))
			.attr('y2', (d) => y(d))
			.attr('stroke', colors.gridLine)
			.attr('stroke-width', spacing.gridWidth);

		// ── Y axis ────────────────────────────────────────────────────────────────
		g.append('g')
			.call(
				d3
					.axisLeft(y)
					.tickValues(yTicks)
					.tickSize(0)
					.tickPadding(spacing.labelPad)
					.tickFormat((v) => v.toLocaleString())
			)
			.call((ax) => ax.select('.domain').remove())
			.selectAll('text')
			.style('font-family', type.sans)
			.style('font-size', `${type.axisLabel}px`)
			.style('fill', colors.warmGray);

		// ── X axis ────────────────────────────────────────────────────────────────
		g.append('g')
			.attr('transform', `translate(0, ${chartH})`)
			.call(d3.axisBottom(x).tickSize(0).tickPadding(spacing.labelPad))
			.call((ax) => ax.select('.domain').remove())
			.selectAll('text')
			.style('font-family', type.sans)
			.style('font-size', `${type.axisLabel}px`)
			.style('fill', colors.warmGray);

		// ── Bars ──────────────────────────────────────────────────────────────────
		const bars = g
			.selectAll('.bar')
			.data(data)
			.join('rect')
			.attr('class', 'bar')
			.attr('x', (d) => x(d.season))
			.attr('y', (d) => y(d.performances))
			.attr('width', x.bandwidth())
			.attr('height', (d) => chartH - y(d.performances))
			.attr('rx', spacing.cornerRadius)
			.attr('fill', (d) => (d.performances === minVal ? colors.roseDark : colors.sageDark))
			.attr('opacity', 0.88)
			.style('cursor', 'pointer');

		// ── Value labels above each bar ───────────────────────────────────────────
		g.selectAll('.bar-label')
			.data(data)
			.join('text')
			.attr('class', 'bar-label')
			.attr('x', (d) => x(d.season) + x.bandwidth() / 2)
			.attr('y', (d) => y(d.performances) - 7)
			.attr('text-anchor', 'middle')
			.style('font-family', type.sans)
			.style('font-size', '12px')
			.style('font-weight', '500')
			.style('fill', (d) => (d.performances === minVal ? colors.roseDark : colors.sageDark))
			.text((d) => d.performances.toLocaleString());

		// ── "Lowest" annotation on min bar ───────────────────────────────────────
		const minD = data.find((d) => d.performances === minVal);
		const annotX = x(minD.season) + x.bandwidth() / 2;
		const annotY = y(minD.performances) - 28;
		g.append('text')
			.attr('x', annotX)
			.attr('y', annotY)
			.attr('text-anchor', 'middle')
			.style('font-family', type.sans)
			.style('font-size', '11px')
			.style('fill', colors.roseDark)
			.text('lowest');

		// ── DataBox wiring — createDataBox requires manual event listeners ────────
		bars.on('click mouseover touchstart', function (event, d) {
			const col = d.performances === minVal ? colors.roseDark : colors.sageDark;
			// Dim all bars, highlight selected
			bars.attr('opacity', 0.3);
			d3.select(this).attr('opacity', 0.88);

			box.show(
				{
					season: d.season,
					perfs: d.performances.toLocaleString(),
					productions: d.productions.toLocaleString(),
					perfsPerProd: (d.performances / d.productions).toFixed(1)
				},
				col
			);
		});

		box.btnG.on('click', () => {
			box.clear();
			bars.attr('opacity', 0.88);
		});

		// ── Accessibility table ───────────────────────────────────────────────────
		addA11yTable(svg.node(), {
			caption: `${title} — data table`,
			columns: [
				{ key: 'season', label: 'Season' },
				{ key: 'perfs', label: 'Performances' },
				{ key: 'productions', label: 'Productions' }
			],
			rows: data.map((d) => ({
				season: d.season,
				perfs: d.performances.toLocaleString(),
				productions: d.productions.toLocaleString()
			}))
		});
	}
</script>

<div bind:this={container} style="position: relative; width: 100%; margin: 2rem 0;" />
