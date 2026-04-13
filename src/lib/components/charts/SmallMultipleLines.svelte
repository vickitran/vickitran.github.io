<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { colors, type, spacing } from '$lib/chartUtils/theme.js';
	import { createSvg, addFurniture, addDataBox, addA11yTable } from '$lib/chartUtils/utils.js';

	// ---------------------------------------------------------------------------
	// Props
	// ---------------------------------------------------------------------------

	/**
	 * data — array of panel objects, one per small-multiple panel, e.g.:
	 *   [
	 *     { label: 'Corn',   series: [{ x: 2008, y: 16.1 }, { x: 2009, y: 14.6 }, ...] },
	 *     { label: 'Wheat',  series: [{ x: 2008, y: 22.7 }, ...] },
	 *   ]
	 *
	 * labelKey  — field name for the panel title   (default: 'label')
	 * seriesKey — field name for the data array    (default: 'series')
	 * xKey      — field name for the x value       (default: 'x')
	 * yKey      — field name for the y value       (default: 'y')
	 *
	 * Sorting:
	 *   sortBy — 'endValue' | 'startValue' | 'label' | 'none'  (default: 'endValue')
	 *
	 * Layout:
	 *   cols     — number of columns in the grid   (default: 5)
	 *   yAxisLabel — unit string shown in subtitle (default: '')
	 *
	 * Databox fields: any key present in each data point is surfaced.
	 *   databoxFields — array of field keys to show (default: ['label','x','y'])
	 */
	export let data = [];

	export let labelKey = 'label';
	export let seriesKey = 'series';
	export let xKey = 'x';
	export let yKey = 'y';

	export let sortBy = 'endValue'; // 'endValue' | 'startValue' | 'label' | 'none'
	export let cols = 5;
	export let yAxisLabel = 'km³';

	export let title = 'Small multiple line chart';
	export let subtitle =
		'Each panel has its own y axis — note scales differ · ghost lines show all panels on a shared scale';
	export let source = '';
	export let width = 960;
	export let height = 620;

	let container;
	onMount(() => {
		draw();
	});

	// ---------------------------------------------------------------------------
	// Helpers
	// ---------------------------------------------------------------------------
	function fmtY(v) {
		if (v >= 100) return Math.round(v).toString();
		if (v >= 10) return Math.round(v).toString();
		if (v >= 1) return v.toFixed(1);
		if (v >= 0.1) return v.toFixed(2);
		return v.toFixed(3);
	}

	// ---------------------------------------------------------------------------
	// Draw
	// ---------------------------------------------------------------------------
	function draw() {
		if (!container || !data || !data.length) return;
		d3.select(container).selectAll('*').remove();

		// --- Sort panels ---
		let panels = [...data];
		if (sortBy === 'endValue') {
			panels.sort((a, b) => {
				const aEnd = a[seriesKey][a[seriesKey].length - 1]?.[yKey] ?? 0;
				const bEnd = b[seriesKey][b[seriesKey].length - 1]?.[yKey] ?? 0;
				return bEnd - aEnd;
			});
		} else if (sortBy === 'startValue') {
			panels.sort((a, b) => {
				const aStart = a[seriesKey][0]?.[yKey] ?? 0;
				const bStart = b[seriesKey][0]?.[yKey] ?? 0;
				return bStart - aStart;
			});
		} else if (sortBy === 'label') {
			panels.sort((a, b) => String(a[labelKey]).localeCompare(String(b[labelKey])));
		}

		const ROWS = Math.ceil(panels.length / cols);
		const allPoints = panels.flatMap((p) => p[seriesKey]);
		const xDomain = d3.extent(allPoints, (d) => d[xKey]);
		const globalYMax = d3.max(allPoints, (d) => d[yKey]);

		// --- Layout constants ---
		const TITLE_H = 85; // space for addFurniture title + subtitle
		const DB_H = 44; // databox band height
		const GRID_TOP = TITLE_H + DB_H;
		const FOOTER_H = spacing.marginDefault.bottom;

		const LABEL_H = 16; // crop title band above each plot box
		const GAP_Y = 10; // vertical gap between rows
		const PAD = { l: 36, r: 6, t: 4, b: 22 };

		const ML = spacing.marginDefault.left;
		const MR = spacing.marginDefault.right;
		const usableW = width - ML - MR;
		const CW = Math.floor(usableW / cols); // cell width
		const CH = Math.round(CW * 0.62); // plot box height (inside label)
		const CELL_H = LABEL_H + CH;

		// Recalculate SVG height to fit content exactly
		const svgH = ROWS * (CELL_H + GAP_Y) + GRID_TOP + FOOTER_H + 18;

		// --- Shared x scale ---
		const xSc = d3
			.scaleLinear()
			.domain(xDomain)
			.range([PAD.l, CW - PAD.r]);

		// --- Per-panel y scales (independent) ---
		const yScales = panels.map((p) => {
			const mx = d3.max(p[seriesKey], (d) => d[yKey]);
			return d3
				.scaleLinear()
				.domain([0, mx])
				.range([CH - PAD.b, PAD.t])
				.nice();
		});

		// --- Global y scale for ghost lines ---
		const yGlobal = d3
			.scaleLinear()
			.domain([0, globalYMax])
			.range([CH - PAD.b, PAD.t]);

		// --- Line generator factory ---
		const lineFn = (ySc) =>
			d3
				.line()
				.x((d) => xSc(d[xKey]))
				.y((d) => ySc(d[yKey]))
				.curve(d3.curveCatmullRom);

		// --- SVG root ---
		const svg = createSvg(container, { width, height: svgH, ariaLabel: `${title} — small multiple line chart` });

		// --- Furniture: title + subtitle + source ---
		addFurniture(svg, { width, height: svgH, title, subtitle, source });

		// --- Databox ---
		// Fields shown: label, x, y (+ yAxisLabel unit)
		const box = addDataBox(svg, {
			width,
			height: svgH,
			fields: ['label', 'x', 'y'],
			total: null,
			y: TITLE_H + 4
		});

		// --- State ---
		let activeIdx = null;
		const panelEls = [];

		// --- Render panels ---
		panels.forEach((panel, idx) => {
			const col = idx % cols;
			const row = Math.floor(idx / cols);
			const gx = col * CW + ML;
			const gy = row * (CELL_H + GAP_Y) + GRID_TOP;
			const series = panel[seriesKey];
			const label = panel[labelKey];
			const ySc = yScales[idx];

			// Outer group for the whole cell (label band + plot box)
			const g = svg
				.append('g')
				.attr('class', 'vl-sm-cell')
				.attr('transform', `translate(${gx}, ${gy})`)
				.attr('role', 'button')
				.attr('tabindex', 0)
				.attr('aria-label', `${label} — click to explore`)
				.style('cursor', 'crosshair')
				.style('outline', 'none');

			// Panel title — sits in the LABEL_H band above the plot box
			// Positioned to align with the left axis spine, never inside the plot
			g.append('text')
				.attr('x', PAD.l)
				.attr('y', LABEL_H - 3)
				.style('font-family', type.sans)
				.style('font-size', '9px')
				.style('font-weight', 500)
				.style('fill', colors.ink)
				.text(label);

			// Plot group — offset down by LABEL_H so title is always above
			const pg = g.append('g').attr('transform', `translate(0, ${LABEL_H})`);

			// Clip path for this panel
			const clipId = `vl-sm-clip-${idx}`;
			svg
				.append('defs')
				.append('clipPath')
				.attr('id', clipId)
				.append('rect')
				.attr('x', PAD.l)
				.attr('y', PAD.t)
				.attr('width', CW - PAD.l - PAD.r)
				.attr('height', CH - PAD.t - PAD.b);

			// Ghost lines — all other panels on global scale (shared reference)
			const ghostG = pg
				.append('g')
				.attr('clip-path', `url(#${clipId})`)
				.attr('pointer-events', 'none');

			panels.forEach((other, oi) => {
				if (oi === idx) return;
				ghostG
					.append('path')
					.attr('class', `vl-ghost vl-ghost-${oi}`)
					.attr('d', lineFn(yGlobal)(other[seriesKey]))
					.attr('fill', 'none')
					.attr('stroke', colors.warmGray)
					.attr('stroke-width', 0.75)
					.attr('opacity', 0.35);
			});

			// Grid lines — follow own y scale ticks (atypical spacing signals independent axis)
			const yTicks = ySc.ticks(3);
			yTicks.forEach((t) => {
				pg.append('line')
					.attr('x1', PAD.l)
					.attr('x2', CW - PAD.r)
					.attr('y1', ySc(t))
					.attr('y2', ySc(t))
					.attr('stroke', colors.warmGray)
					.attr('stroke-width', 0.5)
					.attr('opacity', 0.4)
					.attr('pointer-events', 'none');
			});

			// Left axis spine
			pg.append('line')
				.attr('x1', PAD.l)
				.attr('x2', PAD.l)
				.attr('y1', PAD.t)
				.attr('y2', CH - PAD.b)
				.attr('stroke', colors.gridLine)
				.attr('stroke-width', 0.75);

			// Baseline
			pg.append('line')
				.attr('x1', PAD.l)
				.attr('x2', CW - PAD.r)
				.attr('y1', CH - PAD.b)
				.attr('y2', CH - PAD.b)
				.attr('stroke', colors.warmGray)
				.attr('stroke-width', 0.75);

			// Y axis labels: max + zero on the axis spine
			const yDomMax = ySc.domain()[1];
			pg.append('text')
				.attr('x', PAD.l - 3)
				.attr('y', PAD.t + 1)
				.attr('text-anchor', 'end')
				.attr('dominant-baseline', 'hanging')
				.style('font-size', '8px')
				.style('fill', colors.warmGray)
				.text(fmtY(yDomMax));
			pg.append('text')
				.attr('x', PAD.l - 3)
				.attr('y', CH - PAD.b)
				.attr('text-anchor', 'end')
				.attr('dominant-baseline', 'auto')
				.style('font-size', '8px')
				.style('fill', colors.warmGray)
				.text('0');

			// Mid-tick
			if (yTicks.length > 1) {
				const mid = yTicks[Math.floor(yTicks.length / 2)];
				pg.append('text')
					.attr('x', PAD.l - 3)
					.attr('y', ySc(mid))
					.attr('text-anchor', 'end')
					.attr('dominant-baseline', 'middle')
					.style('font-size', '7.5px')
					.style('fill', colors.warmGray)
					.text(fmtY(mid));
				pg.append('line')
					.attr('x1', PAD.l - 2)
					.attr('x2', PAD.l)
					.attr('y1', ySc(mid))
					.attr('y2', ySc(mid))
					.attr('stroke', colors.warmGray)
					.attr('stroke-width', 0.5);
			}

			// Main series line (own y scale)
			const totalLine = pg
				.append('path')
				.attr('d', lineFn(ySc)(series))
				.attr('fill', 'none')
				.attr('stroke', colors.sageDark)
				.attr('stroke-width', 1.75)
				.attr('clip-path', `url(#${clipId})`)
				.attr('pointer-events', 'none');

			// Hover cursor line
			const cursor = pg
				.append('line')
				.attr('y1', PAD.t)
				.attr('y2', CH - PAD.b)
				.attr('stroke', colors.warmGray)
				.attr('stroke-width', 0.75)
				.attr('stroke-dasharray', '2,2')
				.style('opacity', 0)
				.attr('pointer-events', 'none');

			// Hover dot
			const dot = pg
				.append('circle')
				.attr('r', 3)
				.attr('fill', colors.sageDark)
				.attr('stroke', colors.canvas)
				.attr('stroke-width', 1.5)
				.style('opacity', 0)
				.attr('pointer-events', 'none');

			// X axis year labels below the plot box
			pg.append('text')
				.attr('x', PAD.l)
				.attr('y', CH - PAD.b + 12)
				.style('font-size', '8px')
				.style('fill', colors.warmGray)
				.text(String(xDomain[0]));
			pg.append('text')
				.attr('x', CW - PAD.r)
				.attr('y', CH - PAD.b + 12)
				.attr('text-anchor', 'end')
				.style('font-size', '8px')
				.style('fill', colors.warmGray)
				.text(String(xDomain[1]));

			// Transparent hit rect over the entire cell (label + plot)
			const hit = g
				.append('rect')
				.attr('x', 0)
				.attr('y', 0)
				.attr('width', CW)
				.attr('height', CELL_H)
				.attr('fill', 'transparent');

			panelEls.push({ g, pg, totalLine, dot, cursor, ghostG, series, label, idx, gx, gy, ySc });

			// --- Mouse / keyboard events ---
			function getNearestPoint(event) {
				const [mx] = d3.pointer(event, svg.node());
				const xi = xSc.invert(mx - gx);
				// Find closest data point by x
				let best = 0;
				let bestDist = Infinity;
				series.forEach((d, i) => {
					const dist = Math.abs(d[xKey] - xi);
					if (dist < bestDist) {
						bestDist = dist;
						best = i;
					}
				});
				return best;
			}

			hit
				.on('mousemove', function (event) {
					if (activeIdx !== null && activeIdx !== idx) return;
					const pi = getNearestPoint(event);
					activatePanel(idx, pi);
					const d = series[pi];
					box.show({ label, x: d[xKey], y: d[yKey], value: d[yKey], name: label });
					box.setColor(colors.sageDark);
				})
				.on('mouseleave', () => {
					if (activeIdx === null) deactivateAll();
				})
				.on('click', function (event) {
					event.stopPropagation();
					const pi = getNearestPoint(event);
					if (activeIdx === idx) {
						activeIdx = null;
						deactivateAll();
					} else {
						activeIdx = idx;
						activatePanel(idx, pi);
						const d = series[pi];
						box.show({ label, x: d[xKey], y: d[yKey], value: d[yKey], name: label });
						box.setColor(colors.sageDark);
					}
				})
				.on('keydown', function (event) {
					if (event.key !== 'Enter' && event.key !== ' ') return;
					event.preventDefault();
					event.stopPropagation();
					if (activeIdx === idx) {
						activeIdx = null;
						deactivateAll();
					} else {
						activeIdx = idx;
						activatePanel(idx, 0);
						const d = series[0];
						box.show({ label, x: d[xKey], y: d[yKey], value: d[yKey], name: label });
						box.setColor(colors.sageDark);
					}
				});
		});

		// Reset on SVG background click
		svg.on('click', () => {
			if (activeIdx !== null) {
				activeIdx = null;
				deactivateAll();
			}
		});
		container.addEventListener('mouseleave', () => {
			if (activeIdx === null) deactivateAll();
		});

		// --- Accessibility table ---
		addA11yTable(svg.node(), {
			caption: `${title} — data table`,
			columns: [
				{ key: 'label', label: 'Category' },
				{ key: 'x', label: 'Year' },
				{ key: 'y', label: `Value (${yAxisLabel})` }
			],
			rows: panels.flatMap((p) =>
				p[seriesKey].map((d) => ({
					label: p[labelKey],
					x: d[xKey],
					y: d[yKey].toFixed(3)
				}))
			)
		});

		// ---------------------------------------------------------------------------
		// Interaction helpers
		// ---------------------------------------------------------------------------
		function activatePanel(selIdx, pointIdx) {
			panelEls.forEach(({ totalLine, dot, cursor, ghostG, series, idx, ySc }) => {
				const isSel = idx === selIdx;
				totalLine
					.attr('stroke', isSel ? colors.sageDark : colors.sageMid)
					.attr('stroke-width', isSel ? 2.25 : 1.25)
					.attr('opacity', isSel ? 1 : 0.15);
				ghostG.attr('opacity', isSel ? 0.8 : 0.3);
				if (isSel) {
					const d = series[pointIdx];
					const cx = xSc(d[xKey]);
					const cy = ySc(d[yKey]);
					dot.attr('cx', cx).attr('cy', cy).style('opacity', 1);
					cursor.attr('x1', cx).attr('x2', cx).style('opacity', 0.5);
				} else {
					dot.style('opacity', 0);
					cursor.style('opacity', 0);
				}
			});
		}

		function deactivateAll() {
			panelEls.forEach(({ totalLine, dot, cursor, ghostG }) => {
				totalLine.attr('stroke', colors.sageDark).attr('stroke-width', 1.75).attr('opacity', 1);
				ghostG.attr('opacity', 0.65);
				dot.style('opacity', 0);
				cursor.style('opacity', 0);
			});
			box.clear();
		}
	}
</script>

<div bind:this={container} style="position: relative; width: 100%; margin: 2rem 0;" />
