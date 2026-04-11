<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { colors, categorical, type, spacing } from '$lib/chartUtils/theme.js';
	import { addA11yTable } from '$lib/chartUtils/utils.js';

	export let data;

	export let columns = ['2020', '2021', '2022'];
	export let columnLabels = null; // if null, uses column keys as labels
	export let title = 'Placeholder slopegraph title';
	export let subtitle = 'Insight-first subtitle — what should the reader notice?';
	export let source = 'Your source here';
	export let width = 960;
	export let height = 640;

	let container;

	onMount(() => {
		draw();
	});

	// ─── dodge ───────────────────────────────────────────────────────────────────
	// Iteratively nudge overlapping label positions apart

	function dodge(positions, gap = 14) {
		const result = [...positions];
		let changed = true;
		for (let iter = 0; iter < 300 && changed; iter++) {
			changed = false;
			for (let i = 1; i < result.length; i++) {
				if (result[i] - result[i - 1] < gap) {
					const mid = (result[i] + result[i - 1]) / 2;
					result[i - 1] = mid - gap / 2;
					result[i] = mid + gap / 2;
					changed = true;
				}
			}
		}
		return result;
	}

	// ─── draw ────────────────────────────────────────────────────────────────────

	function draw() {
		if (!container || !data || !columns.length) return;
		d3.select(container).selectAll('*').remove();

		const FOOTER_H = 28;
		const L = spacing.marginDefault.left;
		const R = spacing.marginDefault.left;

		// For multiple columns we need wider label margins on left and right
		const LABEL_W = 140;

		// Data box dimensions (declared early so CHART_TOP can use them)
		const DB_Y = 60;
		const DB_PAD_X = 14;
		const DB_PAD_Y = 8;
		const DB_KEY_SIZE = 11;
		const DB_VAL_SIZE = 15;
		const DB_BOX_H = DB_KEY_SIZE + 4 + DB_VAL_SIZE + DB_PAD_Y * 2;

		// Push chart area below the data box
		const CHART_TOP = DB_Y + DB_BOX_H + 40;
		const chartH = height - CHART_TOP - FOOTER_H - spacing.marginDefault.top;

		const colLabels = columnLabels ?? columns;
		const DOT_R = spacing.dotRadius; // 4
		const STROKE_W = spacing.strokeWidth; // 1.5
		const PAD = spacing.labelPad; // 8

		const svg = d3
			.select(container)
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', `0 0 ${width} ${height}`)
			.attr('role', 'img')
			.attr('aria-label', `${title} — slope chart`)
			.style('background', colors.canvas)
			.style('font-family', type.sans)
			.style('max-width', '100%')
			.style('height', 'auto');

		// ── Title block ───────────────────────────────────────────────────────────

		svg
			.append('text')
			.attr('x', L)
			.attr('y', 24)
			.style('font-family', "'Georgia', serif")
			.style('font-size', `${type.chartTitle}px`)
			.style('font-weight', 400)
			.style('fill', colors.ink)
			.style('line-height', 1.2)
			.text(title);

		svg
			.append('text')
			.attr('x', L)
			.attr('y', 44)
			.style('font-family', type.sans)
			.style('font-size', `${type.chartSubtitle}px`)
			.style('font-weight', 400)
			.style('fill', colors.sageDark)
			.text(subtitle);

		// ── Data box ──────────────────────────────────────────────────────────────

		const dbG = svg
			.append('g')
			.attr('class', 'vl-slope-databox')
			.attr('transform', `translate(${L}, ${DB_Y})`);

		const dbBg = dbG
			.append('rect')
			.attr('height', DB_BOX_H)
			.attr('rx', 4)
			.attr('fill', '#EDE8DC')
			.style('opacity', 0);

		const dbAccent = dbG
			.append('rect')
			.attr('width', 4)
			.attr('height', DB_BOX_H)
			.attr('rx', 2)
			.attr('fill', colors.ink)
			.style('opacity', 0);

		const dbPrompt = dbG
			.append('text')
			.attr('x', DB_PAD_X)
			.attr('y', DB_BOX_H / 2 + 4)
			.style('font-family', type.sans)
			.style('font-size', '13px')
			.style('fill', colors.warmGray)
			.style('font-style', 'italic')
			.text('Tap a line to explore');

		const fields = [
			{ key: 'label', label: 'category' },
			...columns.map((c, i) => ({ key: c, label: colLabels[i] })),
			{ key: 'change', label: 'change' }
		];

		const fieldGroups = [];
		fields.forEach((f, i) => {
			const fg = dbG.append('g').style('opacity', 0);
			let sep = null;
			if (i > 0) {
				sep = fg
					.append('rect')
					.attr('y', DB_PAD_Y)
					.attr('width', 1)
					.attr('height', DB_BOX_H - DB_PAD_Y * 2)
					.attr('fill', '#C8C3B8');
			}
			const keyEl = fg
				.append('text')
				.attr('y', DB_PAD_Y + DB_KEY_SIZE)
				.style('font-family', type.sans)
				.style('font-size', `${DB_KEY_SIZE}px`)
				.style('fill', colors.warmGray)
				.style('letter-spacing', '0.06em')
				.text(f.label);
			const valEl = fg
				.append('text')
				.attr('y', DB_PAD_Y + DB_KEY_SIZE + 4 + DB_VAL_SIZE)
				.style('font-family', type.sans)
				.style('font-size', `${DB_VAL_SIZE}px`)
				.style('font-weight', 500)
				.style('fill', colors.ink)
				.text('');
			fieldGroups.push({ ...f, fg, sep, keyEl, valEl });
		});

		function reflow() {
			let cursor = DB_PAD_X;
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
				cursor += w + DB_PAD_X;
			});
			dbBg.attr('width', cursor + 4);
			dbAccent.attr('x', cursor);
		}

		// Clear button
		const BTN_W = 54;
		const BTN_H = 18;
		const BTN_X = width - spacing.marginDefault.right - BTN_W;
		const BTN_Y = DB_Y + (DB_BOX_H - BTN_H) / 2;

		const btnG = svg
			.append('g')
			.attr('transform', `translate(${BTN_X}, ${BTN_Y})`)
			.style('cursor', 'pointer')
			.style('opacity', 0)
			.style('pointer-events', 'none')
			.attr('role', 'button')
			.attr('tabindex', 0)
			.attr('aria-label', 'Clear selection');

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

		function showBox(d, fillColor) {
			dbPrompt.style('opacity', 0);
			dbBg.style('opacity', 1);
			dbAccent.attr('fill', fillColor).style('opacity', 1);

			const first = d[columns[0]];
			const last = d[columns[columns.length - 1]];
			const diff = last - first;
			const vals = {
				label: d.label,
				change: `${diff > 0 ? '+' : ''}${diff}`
			};
			columns.forEach((c) => {
				vals[c] = String(d[c] ?? '—');
			});

			fieldGroups.forEach(({ key, fg, valEl }) => {
				valEl.text(vals[key]).style('fill', fillColor);
				fg.style('opacity', 1);
			});
			reflow();
			btnG.style('opacity', 1).style('pointer-events', 'all');
		}

		function clearBox() {
			dbPrompt.style('opacity', 1);
			dbBg.style('opacity', 0);
			dbAccent.style('opacity', 0);
			fieldGroups.forEach(({ fg, valEl }) => {
				fg.style('opacity', 0);
				valEl.style('fill', colors.ink);
			});
			btnG.style('opacity', 0).style('pointer-events', 'none');
		}

		// ── Scales ───────────────────────────────────────────────────────────────

		// x: one position per column, with label margins on both sides
		const xScale = d3
			.scalePoint()
			.domain(columns)
			.range([LABEL_W, width - LABEL_W])
			.padding(0.4);

		const allValues = data.flatMap((d) => columns.map((c) => d[c])).filter((v) => v != null);
		const yScale = d3
			.scaleLinear()
			.domain([d3.min(allValues) - 6, d3.max(allValues) + 6])
			.range([CHART_TOP + chartH, CHART_TOP]);

		// ── Axis column lines ─────────────────────────────────────────────────────

		columns.forEach((col, i) => {
			const colX = xScale(col);

			svg
				.append('line')
				.attr('x1', colX)
				.attr('x2', colX)
				.attr('y1', CHART_TOP - 14)
				.attr('y2', CHART_TOP + chartH)
				.attr('stroke', colors.gridLine)
				.attr('stroke-width', spacing.axisWidth);

			// Column header
			svg
				.append('text')
				.attr('x', colX)
				.attr('y', CHART_TOP - 18)
				.attr('text-anchor', 'middle')
				.style('font-family', type.sans)
				.style('font-size', `${type.axisLabel}px`)
				.style('fill', colors.warmGray)
				.style('letter-spacing', '0.04em')
				.text(colLabels[i]);
		});

		// ── Y-axis (right side) ──────────────────────────────────────────────────

		const yAxisX = width - LABEL_W + 20;

		yScale.ticks(6).forEach((t) => {
			const y = yScale(t);

			// Gridline spanning the chart area
			svg
				.append('line')
				.attr('x1', LABEL_W)
				.attr('x2', width - LABEL_W)
				.attr('y1', y)
				.attr('y2', y)
				.attr('stroke', '#C8C3B8')
				.attr('stroke-width', spacing.gridWidth);

			// Tick mark
			svg
				.append('line')
				.attr('x1', yAxisX - 4)
				.attr('x2', yAxisX)
				.attr('y1', y)
				.attr('y2', y)
				.attr('stroke', colors.warmGray)
				.attr('stroke-width', spacing.axisWidth);

			// Label
			svg
				.append('text')
				.attr('x', yAxisX + 6)
				.attr('y', y + 4)
				.attr('text-anchor', 'start')
				.style('font-family', type.sans)
				.style('font-size', `${type.footnote}px`)
				.style('fill', colors.warmGray)
				.text(t.toLocaleString());
		});

		// ── Row color ─────────────────────────────────────────────────────────────

		const colorScale = d3
			.scaleOrdinal()
			.domain(data.map((d) => d.label))
			.range(categorical);

		function rowColor(d) {
			return colorScale(d.label);
		}

		// ── Dodged label positions (precompute) ──────────────────────────────────

		const firstCol = columns[0];
		const lastCol = columns[columns.length - 1];

		const leftSorted = [...data].sort((a, b) => yScale(a[firstCol]) - yScale(b[firstCol]));
		const leftDodged = dodge(leftSorted.map((d) => yScale(d[firstCol])));
		const leftYMap = new Map(leftSorted.map((d, i) => [d.label, leftDodged[i]]));

		const rightSorted = [...data].sort((a, b) => yScale(a[lastCol]) - yScale(b[lastCol]));
		const rightDodged = dodge(rightSorted.map((d) => yScale(d[lastCol])));
		const rightYMap = new Map(rightSorted.map((d, i) => [d.label, rightDodged[i]]));

		// ── Row groups (lines + dots + labels per row) ───────────────────────────

		const rowsG = svg.append('g').attr('class', 'vl-slope-rows');

		const rowGroups = rowsG
			.selectAll('g.vl-slope-row')
			.data(data)
			.join('g')
			.attr('class', 'vl-slope-row')
			.style('cursor', 'pointer');

		rowGroups.each(function (d) {
			const g = d3.select(this);
			const col = rowColor(d);

			// Line segments
			for (let i = 0; i < columns.length - 1; i++) {
				if (d[columns[i]] == null || d[columns[i + 1]] == null) continue;
				g.append('line')
					.attr('x1', xScale(columns[i]))
					.attr('y1', yScale(d[columns[i]]))
					.attr('x2', xScale(columns[i + 1]))
					.attr('y2', yScale(d[columns[i + 1]]))
					.attr('stroke', col)
					.attr('stroke-width', STROKE_W)
					.attr('fill', 'none')
					.attr('opacity', 0.8);
			}

			// Dots at each column
			columns.forEach((c) => {
				if (d[c] == null) return;
				g.append('circle')
					.attr('cx', xScale(c))
					.attr('cy', yScale(d[c]))
					.attr('r', DOT_R)
					.attr('fill', colors.canvas)
					.attr('stroke', col)
					.attr('stroke-width', STROKE_W);
			});

			// Left label
			if (d[firstCol] != null) {
				g.append('text')
					.attr('x', xScale(firstCol) - DOT_R - PAD)
					.attr('y', leftYMap.get(d.label))
					.attr('dy', '0.35em')
					.attr('text-anchor', 'end')
					.style('font-family', type.sans)
					.style('font-size', `${type.axisLabel}px`)
					.style('fill', col)
					.text(`${d.label}`);
			}

			// Right label
			if (d[lastCol] != null) {
				g.append('text')
					.attr('x', xScale(lastCol) + DOT_R + PAD)
					.attr('y', rightYMap.get(d.label))
					.attr('dy', '0.35em')
					.attr('text-anchor', 'start')
					.style('font-family', type.sans)
					.style('font-size', `${type.axisLabel}px`)
					.style('fill', col);
			}

			// Middle column value labels
			if (columns.length > 2) {
				columns.slice(1, -1).forEach((c) => {
					if (d[c] == null) return;
					g.append('text')
						.attr('x', xScale(c))
						.attr('y', yScale(d[c]) - DOT_R - 4)
						.attr('text-anchor', 'middle')
						.style('font-family', type.sans)
						.style('font-size', '10px')
						.style('fill', colors.warmGray);
				});
			}

			// Invisible hit areas along line segments for easier clicking
			for (let i = 0; i < columns.length - 1; i++) {
				if (d[columns[i]] == null || d[columns[i + 1]] == null) continue;
				g.append('line')
					.attr('x1', xScale(columns[i]))
					.attr('y1', yScale(d[columns[i]]))
					.attr('x2', xScale(columns[i + 1]))
					.attr('y2', yScale(d[columns[i + 1]]))
					.attr('stroke', 'transparent')
					.attr('stroke-width', 16)
					.attr('fill', 'none');
			}
		});

		// ── Selection interaction ────────────────────────────────────────────────

		let active = null;

		function reset() {
			active = null;
			rowGroups.style('opacity', null);
			clearBox();
		}

		rowGroups
			.attr('role', 'button')
			.attr('tabindex', 0)
			.attr('aria-label', (d) => {
				const vals = columns
					.map((c) => `${columnLabels ? colLabels[columns.indexOf(c)] : c}: ${d[c] ?? '—'}`)
					.join(', ');
				return `${d.label} — ${vals}`;
			})
			.on('click.slope touchstart.slope keydown.slope', function (event, d) {
				if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
				if (event.type === 'keydown') event.preventDefault();
				event.stopPropagation();

				if (active === this) {
					reset();
				} else {
					active = this;
					rowGroups.style('opacity', 0.12);
					d3.select(this).style('opacity', 1);
					showBox(d, rowColor(d));
				}
			});

		// Clear button handler
		btnG.on('click.slope touchstart.slope keydown.slope', function (event) {
			if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
			event.stopPropagation();
			reset();
		});

		// Background click clears
		svg.on('click.slope touchstart.slope', () => reset());

		// ── Footer source + byline ────────────────────────────────────────────────

		svg
			.append('text')
			.attr('x', L)
			.attr('y', height - 8)
			.attr('text-anchor', 'start')
			.style('font-family', type.sans)
			.style('font-size', `${type.footnote}px`)
			.style('fill', colors.warmGray)
			.text(`Source: ${source}  ·  Victoria Labmayr`);

		// ── A11y table ────────────────────────────────────────────────────────────

		addA11yTable(svg.node(), {
			caption: `${title} — data table`,
			columns: [
				{ key: 'label', label: 'Category' },
				...columns.map((c, i) => ({ key: c, label: colLabels[i] }))
			],
			rows: data.map((d) => ({
				label: d.label,
				...Object.fromEntries(columns.map((c) => [c, d[c] ?? '—']))
			}))
		});
	}
</script>

<div bind:this={container} style="position: relative; width: 100%; margin: 2rem 0;" />
