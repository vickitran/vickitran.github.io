<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { colors, type, spacing } from '$lib/chartUtils/theme.js';
	import { addFurniture, addA11yTable } from '$lib/chartUtils/utils.js';
	export let data;
	export let title = 'Toronto Public Library — Annual Visits';
	export let subtitle =
		'Each icon represents 1 million visits; icon size and position both encode visit count. The pandemic years of 2020–21 saw a dramatic drop in in-person attendance.';
	export let source = 'Toronto Public Library Open Data';
	export let width = 960;
	export let height = 640;

	// TPL brand blue
	const TPL_BLUE = '#0070C0';
	const UNIT = 1_000_000; // 1 icon = 1M visits

	// Icon colour: rose for pandemic years, blue otherwise
	function fillFor(d) {
		return d.year > 2019 ? (d.year > 2021 ? colors.amber : colors.roseDark) : TPL_BLUE;
	}

	let container;

	onMount(() => {
		draw();
	});

	// ─── drawIcon ────────────────────────────────────────────────────────────────
	// Renders a single TPL library-card pictogram centred at (cx, cy).

	function drawIcon(parent, { cx, cy, w, h, rx = 4, fill = TPL_BLUE, opacity = 1 } = {}) {
		const g = parent
			.append('g')
			.attr('transform', `translate(${cx - w / 2}, ${cy - h / 2})`)
			.style('opacity', opacity);

		g.append('rect').attr('width', w).attr('height', h).attr('rx', rx).attr('fill', fill);

		// "tpl:" wordmark scaled to icon size
		const scale = Math.min(w / 44, h / 20);

		const label = g.append('g').attr('transform', `translate(${w / 2}, ${h / 2}) scale(${scale})`);

		label
			.append('text')
			.attr('x', -6)
			.attr('y', 5)
			.attr('text-anchor', 'middle')
			.style('font-family', "'Arial Rounded MT Bold', 'Arial Black', sans-serif")
			.style('font-size', '14px')
			.style('font-weight', '900')
			.style('fill', 'white')
			.style('letter-spacing', '-0.5px')
			.text('tpl');

		label.append('circle').attr('cx', 10).attr('cy', -2).attr('r', 2.2).attr('fill', 'white');
		label.append('circle').attr('cx', 10).attr('cy', 4).attr('r', 2.2).attr('fill', 'white');

		return g;
	}

	// ─── addPictogramDataBox ──────────────────────────────────────────────────
	// A custom data-box suited to year-level selection (replaces the generic
	// addDataBox from utils.js which is tile-oriented).

	function addPictogramDataBox(svg, { y = 80 } = {}) {
		const L = spacing.marginDefault.left;
		const PAD_X = 14;
		const PAD_Y = 8;
		const KEY_SIZE = 11;
		const VAL_SIZE = 15;
		const BOX_H = KEY_SIZE + 4 + VAL_SIZE + PAD_Y * 2;
		const peak = d3.max(data, (d) => d.visits);

		const g = svg
			.append('g')
			.attr('class', 'vl-pictogram-databox')
			.attr('transform', `translate(${L}, ${y - PAD_Y})`);

		const bg = g
			.append('rect')
			.attr('height', BOX_H)
			.attr('rx', 4)
			.attr('fill', '#EDE8DC')
			.style('opacity', 0);

		const accentBar = g
			.append('rect')
			.attr('width', 4)
			.attr('height', BOX_H)
			.attr('rx', 2)
			.attr('fill', TPL_BLUE)
			.style('opacity', 0);

		const prompt = g
			.append('text')
			.attr('x', PAD_X)
			.attr('y', BOX_H / 2 + 4)
			.style('font-family', type.sans)
			.style('font-size', '13px')
			.style('fill', colors.warmGray)
			.style('font-style', 'italic')
			.text('Tap a year to explore');

		const fields = [
			{ key: 'year', label: 'year' },
			{ key: 'visits', label: 'visits' },
			{ key: 'vsPeak', label: 'vs. 2012 peak' }
		];

		const fieldGroups = [];
		fields.forEach((f, i) => {
			const fg = g.append('g').style('opacity', 0);
			let sep = null;
			if (i > 0) {
				sep = fg
					.append('rect')
					.attr('y', PAD_Y)
					.attr('width', 1)
					.attr('height', BOX_H - PAD_Y * 2)
					.attr('fill', '#C8C3B8');
			}
			const keyEl = fg
				.append('text')
				.attr('y', PAD_Y + KEY_SIZE)
				.style('font-family', type.sans)
				.style('font-size', `${KEY_SIZE}px`)
				.style('fill', colors.warmGray)
				.style('letter-spacing', '0.06em')
				.text(f.label);
			const valEl = fg
				.append('text')
				.attr('y', PAD_Y + KEY_SIZE + 4 + VAL_SIZE)
				.style('font-family', type.sans)
				.style('font-size', `${VAL_SIZE}px`)
				.style('font-weight', 500)
				.style('fill', colors.ink)
				.text('');
			fieldGroups.push({ ...f, fg, sep, keyEl, valEl });
		});

		function reflow() {
			let cursor = PAD_X;
			fieldGroups.forEach(({ sep, keyEl, valEl }, i) => {
				if (i > 0) {
					sep.attr('x', cursor);
					cursor += 1 + 12;
				}
				keyEl.attr('x', cursor);
				valEl.attr('x', cursor);
				const w = Math.max(
					keyEl.node().getComputedTextLength(),
					valEl.node().getComputedTextLength()
				);
				cursor += w + PAD_X;
			});
			bg.attr('width', cursor + 4);
			accentBar.attr('x', cursor);
		}

		// Clear button — appended to svg directly so it sits at the right edge,
		// matching the pattern in addDataBox from utils.js
		const BTN_W = 54;
		const BTN_H = 18;
		const BTN_X = width - spacing.marginDefault.right - BTN_W;
		const BTN_Y = y - PAD_Y + (BOX_H - BTN_H) / 2;

		const btnG = svg
			.append('g')
			.attr('transform', `translate(${BTN_X}, ${BTN_Y})`)
			.style('cursor', 'pointer')
			.style('opacity', 0)
			.style('pointer-events', 'none');

		btnG
			.append('rect')
			.attr('width', BTN_W)
			.attr('height', BTN_H)
			.attr('rx', 3)
			.attr('fill', 'none')
			.attr('stroke', colors.warmGray)
			.attr('stroke-width', 1)
			.attr('stroke-dasharray', '3,2');

		btnG
			.append('text')
			.attr('x', BTN_W / 2)
			.attr('y', 12)
			.attr('text-anchor', 'middle')
			.style('font-family', type.sans)
			.style('font-size', '12px')
			.style('fill', colors.warmGray)
			.text('clear ✕');

		const box = {
			show(d) {
				prompt.style('opacity', 0);
				bg.style('opacity', 1);
				accentBar.attr('fill', fillFor(d)).style('opacity', 1);

				const vals = {
					year: String(d.year),
					visits: d.visits.toLocaleString(),
					icons: Math.round(d.visits / UNIT).toLocaleString(),
					vsPeak: `${((d.visits / peak) * 100).toFixed(0)}%`
				};
				fieldGroups.forEach(({ key, fg, valEl }) => {
					valEl.text(vals[key]).style('fill', fillFor(d));
					fg.style('opacity', 1);
				});
				reflow();
				btnG.style('opacity', 1).style('pointer-events', 'all');
			},
			clear() {
				prompt.style('opacity', 1);
				bg.style('opacity', 0);
				accentBar.style('opacity', 0);
				fieldGroups.forEach(({ fg, valEl }) => {
					fg.style('opacity', 0);
					valEl.style('fill', colors.ink);
				});
				btnG.style('opacity', 0).style('pointer-events', 'none');
			},
			// Expose btnG so drawSlope can wire up the click handler
			get btnG() {
				return btnG;
			}
		};

		return box;
	}

	// ─── draw ────────────────────────────────────────────────────────────────────

	function draw() {
		if (!container || !data) return;
		d3.select(container).selectAll('*').remove();

		const TITLE_H = 110;
		const FOOTER_H = 28;
		const L = spacing.marginDefault.left;
		const R = spacing.marginDefault.left;
		const chartW = width - L - R;
		const chartH = height - TITLE_H - FOOTER_H - spacing.marginDefault.top;

		const svg = d3
			.select(container)
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', `0 0 ${width} ${height}`)
			.attr('role', 'img')
			.attr('aria-label', `${title} — pictogram slope chart`)
			.style('background', colors.canvas)
			.style('font-family', type.sans)
			.style('max-width', '100%')
			.style('height', 'auto');

		addFurniture(svg, { width, height, title, subtitle, source });

		const box = addPictogramDataBox(svg, { y: 80 });

		const chartG = svg.append('g').attr('transform', `translate(${L}, ${TITLE_H})`);

		// Legend at y:52 — matching Treemap pattern
		const legendGroups = [
			{ label: 'Peak years (2012–2019)', fill: '#0070C0' },
			{ label: 'Pandemic years (2020–2021)', fill: colors.roseDark },
			{ label: 'Post years (2022–2023)', fill: colors.amber }
		];

		const legendG = svg
			.append('g')
			.attr('transform', `translate(${L}, 52)`)
			.attr('role', 'list')
			.attr('aria-label', 'Colour legend');

		const legendSpacing = Math.min(220, (chartW - 20) / legendGroups.length);
		legendGroups.forEach((grp, i) => {
			const lx = i * legendSpacing;
			const itemG = legendG.append('g').attr('role', 'listitem');
			itemG
				.append('rect')
				.attr('x', lx)
				.attr('y', 0)
				.attr('width', 10)
				.attr('height', 10)
				.attr('rx', 2)
				.attr('fill', grp.fill)
				.attr('aria-hidden', 'true');
			itemG
				.append('text')
				.attr('x', lx + 14)
				.attr('y', 9)
				.style('fill', colors.warmGray)
				.style('font-family', type.sans)
				.style('font-size', '11px')
				.text(grp.label);
		});

		drawSlope(svg, chartG, chartW, chartH, box);

		addA11yTable(svg.node(), {
			caption: `${title} — data table`,
			columns: [
				{ key: 'year', label: 'Year' },
				{ key: 'visits', label: 'Visits' },
				{ key: 'icons', label: 'Icons (1M each)' }
			],
			rows: data.map((d) => ({
				year: d.year,
				visits: d.visits.toLocaleString(),
				icons: Math.round(d.visits / UNIT)
			}))
		});
	}

	// ─── drawSlope ────────────────────────────────────────────────────────────────
	// One icon per year. Vertical position and icon size both encode visit count.
	// A dashed catmull-rom line connects the icon centres to show the trend.
	// Clicking an icon dims all others and populates the data box.

	function drawSlope(svg, g, chartW, chartH, box) {
		const LABEL_H = 28;
		const GRID_LEFT = 28; // space for y-axis labels
		const ICON_MAX_W = 50;
		const ICON_MIN_W = 20;
		const ICON_MAX_H = ICON_MAX_W / 2.2;
		const ICON_MIN_H = ICON_MIN_W / 2.2;

		// ── Scales ─────────────────────────────────────────────────────────────

		const xScale = d3
			.scalePoint()
			.domain(data.map((d) => d.year))
			.range([GRID_LEFT + ICON_MAX_W / 2, chartW - ICON_MAX_W / 2])
			.padding(0.1);

		const sizeScale = d3
			.scaleSqrt()
			.domain(d3.extent(data, (d) => d.visits))
			.range([ICON_MIN_W, ICON_MAX_W]);

		const yScale = d3
			.scaleLinear()
			.domain([0, d3.max(data, (d) => d.visits) * 1.08])
			.range([chartH - LABEL_H - 8, ICON_MAX_H / 2 + 12]);

		// ── Grid lines + y-axis labels ──────────────────────────────────────────

		const gridG = g.append('g').attr('class', 'vl-grid');

		yScale.ticks(5).forEach((t) => {
			const y = yScale(t);

			gridG
				.append('line')
				.attr('x1', GRID_LEFT)
				.attr('x2', chartW)
				.attr('y1', y)
				.attr('y2', y)
				.attr('stroke', colors.gridLine)
				.attr('stroke-width', spacing.gridWidth);

			gridG
				.append('text')
				.attr('x', GRID_LEFT - 4)
				.attr('y', y + 4)
				.attr('text-anchor', 'end')
				.style('font-family', type.sans)
				.style('font-size', '11px')
				.style('fill', colors.warmGray)
				.text(`${(t / 1_000_000).toFixed(0)}M`);
		});

		// ── Dashed trend line ───────────────────────────────────────────────────

		const lineData = data.map((d) => [xScale(d.year), yScale(d.visits)]);

		g.append('path')
			.datum(lineData)
			.attr(
				'd',
				d3
					.line()
					.x((d) => d[0])
					.y((d) => d[1])
					.curve(d3.curveCatmullRom.alpha(0.5))
			)
			.attr('fill', 'none')
			.attr('stroke', colors.sageLight)
			.attr('stroke-width', 1.5)
			.attr('stroke-dasharray', '4,3');

		// ── Icons + year labels ─────────────────────────────────────────────────

		let active = null;

		const iconNodes = g
			.selectAll('g.vl-slope-icon')
			.data(data)
			.join('g')
			.attr('class', 'vl-slope-icon')
			.style('cursor', 'pointer');

		iconNodes.each(function (d) {
			const ig = d3.select(this);
			const iw = sizeScale(d.visits);
			const ih = iw / 2.2;
			const cx = xScale(d.year);
			const cy = yScale(d.visits);

			drawIcon(ig, {
				cx,
				cy,
				w: iw,
				h: ih,
				rx: Math.max(3, iw * 0.1),
				fill: fillFor(d),
				opacity: 0.92
			});

			// Year label along the x-axis baseline
			ig.append('text')
				.attr('x', cx)
				.attr('y', chartH - LABEL_H + 16)
				.attr('text-anchor', 'middle')
				.style('font-family', type.sans)
				.style('font-size', '10px')
				.style('fill', colors.warmGray)
				.text(d.year);

			// Invisible circular hit area sized to the icon (generous padding)
			ig.append('circle')
				.attr('cx', cx)
				.attr('cy', cy)
				.attr('r', Math.max(iw, 28) / 2 + 8)
				.attr('fill', 'transparent')
				.attr('stroke', 'none');
		});

		// ── Selection interaction ───────────────────────────────────────────────

		function reset() {
			active = null;
			iconNodes.style('opacity', null);
			box.clear();
		}

		iconNodes
			.attr('role', 'button')
			.attr('tabindex', 0)
			.attr(
				'aria-label',
				(d) =>
					`${d.year}: ${d.visits.toLocaleString()} visits, ${Math.round(d.visits / UNIT)} icons`
			)
			.on('click.slope touchstart.slope keydown.slope', function (event, d) {
				if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
				if (event.type === 'keydown') event.preventDefault();
				event.stopPropagation();

				if (active === this) {
					reset();
				} else {
					active = this;
					iconNodes.style('opacity', 0.2);
					d3.select(this).style('opacity', 1);
					box.show(d);
				}
			});

		// Clear button
		box.btnG
			.attr('role', 'button')
			.attr('tabindex', 0)
			.attr('aria-label', 'Clear selection')
			.on('click.slope touchstart.slope keydown.slope', function (event) {
				if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
				event.stopPropagation();
				reset();
			});

		// Click on SVG background clears selection
		svg.on('click.slope touchstart.slope', () => reset());
	}
</script>

<div bind:this={container} style="position: relative; width: 100%; margin: 2rem 0;" />
