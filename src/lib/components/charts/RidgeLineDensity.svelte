<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { colors, categorical, type, spacing } from '$lib/chartUtils/theme.js';
	import { addFurniture, addDataBox, addA11yTable } from '$lib/chartUtils/utils.js';

	// --- Props ---
	/**
	 * data — array of raw numeric values per group, e.g.:
	 *   [
	 *     { group: 'Northern', values: [310, 420, 380, ...] },
	 *     { group: 'Southern', values: [260, 310, 350, ...] },
	 *   ]
	 *
	 * groupKey  — field name for the group label  (default: 'group')
	 * valuesKey — field name for the values array (default: 'values')
	 * bandwidth — KDE smoothing bandwidth. Higher = smoother.
	 * xDomain   — [min, max] for the x axis. Inferred from data if omitted.
	 * patterns  — array of 'diagonal' | 'crosshatch' | 'stipple', one per group.
	 */
	export let data = [
		{
			group: 'Northern',
			values: [
				310, 340, 360, 370, 375, 380, 385, 390, 395, 400, 405, 410, 415, 420, 425, 430, 435, 440,
				450, 460, 480, 510, 560, 580, 610
			]
		},
		{
			group: 'Southern',
			values: [
				260, 280, 295, 300, 305, 310, 315, 320, 325, 330, 335, 340, 345, 350, 360, 370, 380, 390,
				410, 445, 480, 520
			]
		},
		{
			group: 'Eastern',
			values: [
				240, 260, 270, 275, 280, 285, 290, 295, 300, 305, 310, 320, 330, 340, 355, 370, 390, 410
			]
		}
	];

	export let groupKey = 'group';
	export let valuesKey = 'values';
	export let bandwidth = 40;
	export let xDomain = null;
	export let patterns = ['diagonal', 'crosshatch', 'stipple'];

	export let title = 'Revenue distribution by region';
	export let subtitle = 'Ridgeline — shared y scale, bold texture fills';
	export let source = 'Internal sales data';
	export let width = 960;
	export let height = 600;

	let container;
	onMount(() => {
		draw();
	});

	// --- KDE helpers ---
	function epanechnikov(bw) {
		return (v) => (Math.abs((v /= bw)) <= 1 ? (0.75 * (1 - v * v)) / bw : 0);
	}
	function kde(kernel, thresholds, values) {
		return thresholds.map((x) => [x, d3.mean(values, (v) => kernel(x - v))]);
	}
	function groupStats(values, group, curve) {
		const mean = d3.mean(values);
		const peak = curve.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
		return { group, mean, peak, n: values.length };
	}

	// --- Pattern builders ---
	function buildPattern(defs, id, patternType, color) {
		if (patternType === 'diagonal') {
			const pat = defs
				.append('pattern')
				.attr('id', id)
				.attr('patternUnits', 'userSpaceOnUse')
				.attr('width', 12)
				.attr('height', 12)
				.attr('patternTransform', 'rotate(45)');
			pat
				.append('line')
				.attr('x1', 0)
				.attr('y1', 2)
				.attr('x2', 9)
				.attr('y2', 2)
				.attr('stroke', color)
				.attr('stroke-width', 2.8)
				.attr('stroke-linecap', 'round');
			pat
				.append('line')
				.attr('x1', 1)
				.attr('y1', 8)
				.attr('x2', 10)
				.attr('y2', 8)
				.attr('stroke', color)
				.attr('stroke-width', 2.8)
				.attr('stroke-linecap', 'round');
		} else if (patternType === 'crosshatch') {
			const pat = defs
				.append('pattern')
				.attr('id', id)
				.attr('patternUnits', 'userSpaceOnUse')
				.attr('width', 10)
				.attr('height', 10);
			pat
				.append('line')
				.attr('x1', 0)
				.attr('y1', 0)
				.attr('x2', 10)
				.attr('y2', 10)
				.attr('stroke', color)
				.attr('stroke-width', 1.8);
			pat
				.append('line')
				.attr('x1', 10)
				.attr('y1', 0)
				.attr('x2', 0)
				.attr('y2', 10)
				.attr('stroke', color)
				.attr('stroke-width', 1.8);
		} else if (patternType === 'stipple') {
			const pat = defs
				.append('pattern')
				.attr('id', id)
				.attr('patternUnits', 'userSpaceOnUse')
				.attr('width', 8)
				.attr('height', 8);
			pat.append('circle').attr('cx', 2).attr('cy', 2).attr('r', 1.8).attr('fill', color);
			pat.append('circle').attr('cx', 6).attr('cy', 6).attr('r', 1.8).attr('fill', color);
			pat
				.append('circle')
				.attr('cx', 6)
				.attr('cy', 2)
				.attr('r', 0.9)
				.attr('fill', color)
				.attr('opacity', 0.55);
			pat
				.append('circle')
				.attr('cx', 2)
				.attr('cy', 6)
				.attr('r', 0.9)
				.attr('fill', color)
				.attr('opacity', 0.55);
		}
	}

	// --- Draw ---
	function draw() {
		if (!container || !data || !data.length) return;
		d3.select(container).selectAll('*').remove();

		const groups = data.map((d) => d[groupKey]);
		const allValues = data.flatMap((d) => d[valuesKey]);

		// Layout
		const TITLE_H = 130;
		const FOOTER_H = 30;
		const ROW_GAP = 14;
		// Labels sit above each row as a small header band
		const LABEL_H = 18;
		const ML = spacing.marginDefault.left;
		const MR = spacing.marginDefault.right;
		const MT = TITLE_H;
		const MB = spacing.marginDefault.bottom + FOOTER_H;

		const cW = width - ML - MR;
		// Each "slot" = label header + density row
		const totalSlotSpace = height - MT - MB;
		const SLOT_H = Math.floor((totalSlotSpace - ROW_GAP * (groups.length - 1)) / groups.length);
		const ROW_H = SLOT_H - LABEL_H;

		// Colour scale
		const colorScale = d3.scaleOrdinal().domain(groups).range(categorical);

		// X scale
		const inferredDomain = xDomain ?? [
			d3.min(allValues) - bandwidth * 2,
			d3.max(allValues) + bandwidth * 2
		];
		const xSc = d3.scaleLinear().domain(inferredDomain).range([0, cW]);
		const thresholds = xSc.ticks(200);

		// Build all curves first → global y max for shared scale
		const builtCurves = data.map((d) => ({
			group: d[groupKey],
			values: d[valuesKey],
			curve: kde(epanechnikov(bandwidth), thresholds, d[valuesKey])
		}));

		// Shared y scale — identical across all rows so peaks are comparable
		const globalYMax = d3.max(
			builtCurves.flatMap((c) => c.curve),
			(d) => d[1]
		);
		const ySc = d3
			.scaleLinear()
			.domain([0, globalYMax * 1.15])
			.range([ROW_H, 0]);

		// Path generators
		const areaFn = d3
			.area()
			.x((d) => xSc(d[0]))
			.y0(ROW_H)
			.y1((d) => ySc(d[1]))
			.curve(d3.curveBasis);
		const lineFn = d3
			.line()
			.x((d) => xSc(d[0]))
			.y((d) => ySc(d[1]))
			.curve(d3.curveBasis);

		// SVG root
		const svg = d3
			.select(container)
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', `0 0 ${width} ${height}`)
			.attr('role', 'img')
			.attr('aria-label', `${title} — ridgeline density chart`)
			.style('background', colors.canvas)
			.style('font-family', type.sans)
			.style('max-width', '100%')
			.style('height', 'auto');

		const defs = svg.append('defs');

		// Patterns
		const patIds = groups.map((grp, i) => {
			const id = `vl-pat-${i}`;
			buildPattern(defs, id, patterns[i] ?? 'diagonal', colorScale(grp));
			return id;
		});

		// Furniture (title, subtitle, source, byline)
		addFurniture(svg, { width, height, title, subtitle, source });

		// Legend
		const legendG = svg
			.append('g')
			.attr('transform', `translate(${ML}, 56)`)
			.attr('role', 'list')
			.attr('aria-label', 'Colour legend');
		const legendSpacing = Math.min(130, (cW - 20) / groups.length);
		groups.forEach((grp, i) => {
			const lx = i * legendSpacing;
			const itemG = legendG.append('g').attr('role', 'listitem');
			itemG
				.append('rect')
				.attr('x', lx)
				.attr('y', 0)
				.attr('width', 14)
				.attr('height', 10)
				.attr('rx', 1)
				.attr('fill', `url(#${patIds[i]})`)
				.attr('stroke', colorScale(grp))
				.attr('stroke-width', 1.5)
				.attr('aria-hidden', 'true');
			itemG
				.append('text')
				.attr('x', lx + 20)
				.attr('y', 9)
				.style('fill', colors.warmGray)
				.style('font-family', type.sans)
				.style('font-size', '11px')
				.text(grp);
		});

		// Databox
		const box = addDataBox(svg, {
			width,
			height,
			fields: ['group', 'mean', 'n'],
			total: null,
			y: 84
		});

		// --- Rows ---
		let activeGroup = null;
		const rowEntries = [];

		builtCurves.forEach(({ group, values, curve }, i) => {
			const color = colorScale(group);
			const stats = groupStats(values, group, curve);
			const clipId = `vl-row-clip-${i}`;

			// Each slot: label header then density row beneath it
			const slotTop = MT + i * (SLOT_H + ROW_GAP);
			const rowTop = slotTop + LABEL_H;

			// Clip path covers only the density row (not the label area)
			defs
				.append('clipPath')
				.attr('id', clipId)
				.append('rect')
				.attr('width', cW)
				.attr('height', ROW_H)
				.attr('rx', 2);

			// Slot group — the clickable region covering label + row
			const slot = svg
				.append('g')
				.attr('class', 'vl-ridge-slot')
				.datum(group)
				.attr('role', 'button')
				.attr('tabindex', 0)
				.attr(
					'aria-label',
					`${group} — peak at ${Math.round(stats.peak)}, mean ${stats.mean.toFixed(2)}, n=${
						stats.n
					}`
				)
				.style('cursor', 'pointer')
				.style('outline', 'none');

			// --- Group label above the row ---
			slot
				.append('text')
				.attr('x', ML)
				.attr('y', slotTop + LABEL_H - 5)
				.style('font-family', type.sans)
				.style('font-size', '11px')
				.style('fill', color)
				.style('font-weight', 500)
				.attr('pointer-events', 'none')
				.text(group);

			// Row group translated to rowTop
			const rg = slot
				.append('g')
				.attr('class', 'vl-ridge-row')
				.attr('transform', `translate(${ML}, ${rowTop})`);

			// Canvas background
			rg.append('rect')
				.attr('class', 'row-bg')
				.attr('x', 0)
				.attr('y', 0)
				.attr('width', cW)
				.attr('height', ROW_H)
				.attr('fill', colors.canvas)
				.attr('rx', 2);

			const inner = rg.append('g').attr('clip-path', `url(#${clipId})`);

			// Subtle row grid lines — same ticks every row (shared ySc = comparable)
			inner
				.selectAll('.vl-row-grid')
				.data(ySc.ticks(3))
				.join('line')
				.attr('class', 'vl-row-grid')
				.attr('x1', 0)
				.attr('x2', cW)
				.attr('y1', (d) => ySc(d))
				.attr('y2', (d) => ySc(d))
				.attr('stroke', colors.gridLine)
				.attr('stroke-width', 0.6)
				.attr('pointer-events', 'none');

			// Baseline
			inner
				.append('line')
				.attr('x1', 0)
				.attr('x2', cW)
				.attr('y1', ROW_H)
				.attr('y2', ROW_H)
				.attr('stroke', colors.gridLine)
				.attr('stroke-width', 1)
				.attr('pointer-events', 'none');

			// Textured fill
			const fillPath = inner
				.append('path')
				.attr('class', 'vl-density-fill')
				.attr('d', areaFn(curve))
				.attr('fill', `url(#${patIds[i]})`)
				.attr('opacity', 0.92);

			// Colour stroke
			const strokePath = inner
				.append('path')
				.attr('class', 'vl-density-line')
				.attr('d', lineFn(curve))
				.attr('fill', 'none')
				.attr('stroke', color)
				.attr('stroke-width', 2.5);

			// Transparent hit area
			inner.append('path').attr('d', areaFn(curve)).attr('fill', 'transparent');

			// Mean line — vertical dashed rule from baseline up to the curve
			const meanX = xSc(stats.mean);
			// Find the density value at the mean by interpolating the curve array
			const meanDensity = (() => {
				const bisect = d3.bisector((d) => d[0]).left;
				const idx = bisect(curve, stats.mean);
				const a = curve[Math.max(0, idx - 1)];
				const b = curve[Math.min(curve.length - 1, idx)];
				if (!a || !b || a[0] === b[0]) return (a ?? b)[1];
				const t = (stats.mean - a[0]) / (b[0] - a[0]);
				return a[1] + t * (b[1] - a[1]);
			})();
			const meanCurveY = ySc(meanDensity); // y pixel where the curve sits at mean x

			inner
				.append('line')
				.attr('class', 'vl-mean-line')
				.attr('x1', meanX)
				.attr('x2', meanX)
				.attr('y1', meanCurveY)
				.attr('y2', ROW_H)
				.attr('stroke', color)
				.attr('stroke-width', 1.5)
				.attr('stroke-dasharray', '4,3')
				.attr('opacity', 0.85)
				.attr('pointer-events', 'none');

			// Mean value label — sits just above the curve at the mean x position
			const nearRight = meanX + 50 > cW;
			inner
				.append('text')
				.attr('class', 'vl-mean-label')
				.attr('x', nearRight ? meanX - 5 : meanX + 5)
				.attr('y', meanCurveY - 6)
				.attr('text-anchor', nearRight ? 'end' : 'start')
				.style('font-family', type.sans)
				.style('font-size', '10px')
				.style('fill', color)
				.style('font-weight', 500)
				.attr('pointer-events', 'none')
				.text(`μ ${stats.mean.toFixed(2)}`);

			rowEntries.push({ slot, rg, fillPath, strokePath, inner, group, curve, stats, i });

			// --- Interaction ---
			function select() {
				activeGroup = group;
				rowEntries.forEach(
					({ slot: s, fillPath: fp, strokePath: sp, inner: inn, group: gg, curve: c, i: ii }) => {
						const isSel = gg === group;
						s.style('opacity', isSel ? 1 : 0.18);
						fp.attr('opacity', isSel ? 1 : 0.92);
						sp.attr('stroke-width', isSel ? 3 : 2.5);
						inn.select('.vl-density-outline').remove();
						if (isSel) {
							inn
								.append('path')
								.attr('class', 'vl-density-outline')
								.attr('d', lineFn(c))
								.attr('fill', 'none')
								.attr('stroke', colors.ink)
								.attr('stroke-width', 1.5)
								.attr('opacity', 0.4)
								.attr('pointer-events', 'none')
								.raise();
						}
					}
				);
				box.show({
					group: stats.group,
					peak: Math.round(stats.peak),
					mean: +stats.mean.toFixed(2),
					n: stats.n,
					value: stats.n,
					name: stats.group
				});
				box.setColor(color);
			}

			function reset() {
				activeGroup = null;
				rowEntries.forEach(({ slot: s, fillPath: fp, strokePath: sp, inner: inn }) => {
					s.style('opacity', null);
					fp.attr('opacity', 0.92);
					sp.attr('stroke-width', 2.5);
					inn.select('.vl-density-outline').remove();
				});
				box.clear();
			}

			slot.on('click', function (event) {
				event.stopPropagation();
				activeGroup === group ? reset() : select();
			});
			slot.on('keydown', function (event) {
				if (event.key !== 'Enter' && event.key !== ' ') return;
				event.preventDefault();
				event.stopPropagation();
				activeGroup === group ? reset() : select();
			});
			svg.on('click.ridge', reset);
		});

		// Shared x axis below all rows
		const xAxisY = MT + groups.length * (SLOT_H + ROW_GAP) - ROW_GAP + 8;
		svg
			.append('g')
			.attr('transform', `translate(${ML}, ${xAxisY})`)
			.call(d3.axisBottom(xSc).tickSize(0).tickPadding(spacing.labelPad).ticks(8))
			.call((ax) => ax.select('.domain').attr('stroke', colors.gridLine))
			.selectAll('text')
			.style('font-family', type.sans)
			.style('font-size', `${type.axisLabel}px`)
			.style('fill', colors.warmGray);

		// x axis label
		svg
			.append('text')
			.attr('x', ML + cW / 2)
			.attr('y', xAxisY + 32)
			.attr('text-anchor', 'middle')
			.style('font-family', type.sans)
			.style('font-size', `${type.axisLabel}px`)
			.style('fill', colors.warmGray)
			.text('Value');

		// Accessibility table
		addA11yTable(svg.node(), {
			caption: `${title} — data table`,
			columns: [
				{ key: 'group', label: 'Group' },
				{ key: 'n', label: 'Count' },
				{ key: 'mean', label: 'Mean' }
				// { key: 'peak', label: 'Peak x' }
			],
			rows: builtCurves.map(({ group, values, curve }) => {
				const s = groupStats(values, group, curve);
				return { group, n: s.n, mean: +s.mean.toFixed(2), peak: Math.round(s.peak) };
			})
		});
	}
</script>

<div bind:this={container} style="position: relative; width: 100%; margin: 2rem 0;" />
