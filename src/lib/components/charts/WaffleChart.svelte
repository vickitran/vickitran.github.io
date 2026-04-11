<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { colors, categorical, type, spacing } from '$lib/chartUtils/theme.js';
	import { addFurniture, addA11yTable } from '$lib/chartUtils/utils.js';

	// Each cell represents this many units
	export let unit = 1;
	// Human-readable label for one cell, used in the data box
	export let unitLabel = 'unit';
	// Number of columns in the waffle grid
	export let cols = 20;
	export let data;
	export let title;
	export let subtitle;
	export let source;
	export let width = 960;
	export let height = 700;

	let container;

	onMount(() => {
		draw();
	});

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
			.attr('aria-label', `${title} — waffle chart`)
			.style('background', colors.canvas)
			.style('font-family', type.sans)
			.style('max-width', '100%')
			.style('height', 'auto');

		addFurniture(svg, { width, height, title, subtitle, source });

		const total = d3.sum(data, (d) => d.value);
		const totalCells = Math.round(total / unit);
		const colorScale = d3
			.scaleOrdinal()
			.domain(data.map((d) => d.name))
			.range(categorical);

		// ── Legend at y:52 ────────────────────────────────────────────────────────
		// Two rows if more than 5 items, single row otherwise

		const legendG = svg
			.append('g')
			.attr('transform', `translate(${L}, 52)`)
			.attr('role', 'list')
			.attr('aria-label', 'Colour legend');

		const LEGEND_COLS = Math.min(data.length, 5);
		const legendColW = chartW / LEGEND_COLS;

		data.forEach((d, i) => {
			const col = i % LEGEND_COLS;
			const row = Math.floor(i / LEGEND_COLS);
			const lx = col * legendColW;
			const ly = row * 16;
			const itemG = legendG.append('g').attr('role', 'listitem');

			itemG
				.append('rect')
				.attr('x', lx)
				.attr('y', ly)
				.attr('width', 10)
				.attr('height', 10)
				.attr('rx', 2)
				.attr('fill', colorScale(d.name))
				.attr('aria-hidden', 'true');

			itemG
				.append('text')
				.attr('x', lx + 14)
				.attr('y', ly + 9)
				.style('fill', colors.warmGray)
				.style('font-family', type.sans)
				.style('font-size', '11px')
				.text(d.name);
		});

		// ── Data box ──────────────────────────────────────────────────────────────
		// Sits below the legend. Y offset accounts for 1 or 2 legend rows.

		const legendRows = Math.ceil(data.length / LEGEND_COLS);
		const DB_Y = 52 + legendRows * 16 + 14;

		const PAD_X = 14;
		const PAD_Y = 8;
		const KEY_SIZE = 11;
		const VAL_SIZE = 15;
		const BOX_H = KEY_SIZE + 4 + VAL_SIZE + PAD_Y * 2;

		const dbG = svg
			.append('g')
			.attr('class', 'vl-waffle-databox')
			.attr('transform', `translate(${L}, ${DB_Y})`);

		const bg = dbG
			.append('rect')
			.attr('height', BOX_H)
			.attr('rx', 4)
			.attr('fill', '#EDE8DC')
			.style('opacity', 0);

		const accentBar = dbG
			.append('rect')
			.attr('width', 4)
			.attr('height', BOX_H)
			.attr('rx', 2)
			.attr('fill', colors.ink)
			.style('opacity', 0);

		const prompt = dbG
			.append('text')
			.attr('x', PAD_X)
			.attr('y', BOX_H / 2 + 4)
			.style('font-family', type.sans)
			.style('font-size', '13px')
			.style('fill', colors.warmGray)
			.style('font-style', 'italic')
			.text('Tap a group to explore');

		const fields = [
			{ key: 'name', label: 'region' },
			{ key: 'value', label: 'total' },
			{ key: 'pct', label: 'share of total' }
		];

		const fieldGroups = [];
		fields.forEach((f, i) => {
			const fg = dbG.append('g').style('opacity', 0);
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

		// Clear button — right-aligned, matching utils.js pattern
		const BTN_W = 54;
		const BTN_H = 18;
		const BTN_X = width - spacing.marginDefault.right - BTN_W;
		const BTN_Y = DB_Y + (BOX_H - BTN_H) / 2;

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

		function showBox(d, fill) {
			prompt.style('opacity', 0);
			bg.style('opacity', 1);
			accentBar.attr('fill', fill).style('opacity', 1);

			const vals = {
				name: d.name,
				cells: Math.round(d.value / unit).toLocaleString(),
				value: d.value.toLocaleString(),
				pct: `${((d.value / total) * 100).toFixed(1)}%`
			};
			fieldGroups.forEach(({ key, fg, valEl }) => {
				valEl.text(vals[key]).style('fill', fill);
				fg.style('opacity', 1);
			});
			reflow();
			btnG.style('opacity', 1).style('pointer-events', 'all');
		}

		function clearBox() {
			prompt.style('opacity', 1);
			bg.style('opacity', 0);
			accentBar.style('opacity', 0);
			fieldGroups.forEach(({ fg, valEl }) => {
				fg.style('opacity', 0);
				valEl.style('fill', colors.ink);
			});
			btnG.style('opacity', 0).style('pointer-events', 'none');
		}

		// ── Waffle grid ───────────────────────────────────────────────────────────

		// Push chart top down far enough to clear legend + databox
		const CHART_TOP = DB_Y + BOX_H + 16;
		const waffleH = height - CHART_TOP - FOOTER_H - 8;

		const rows = Math.ceil(totalCells / cols);
		const cellSize = Math.min(chartW / cols, waffleH / rows);
		const GAP = Math.max(2, cellSize * 0.1);
		const cellW = cellSize - GAP;
		const rx = Math.max(1, cellW * 0.15);

		// Total grid width/height so we can centre it
		const gridW = cols * cellSize;
		const gridH = rows * cellSize;
		const gridX = L + (chartW - gridW) / 2;
		const gridY = CHART_TOP;

		// Build flat cell list ordered bottom-to-top, left-to-right
		// so the waffle fills from the bottom like a bar chart
		const cells = [];
		data.forEach((d) => {
			const n = Math.round(d.value / unit);
			for (let i = 0; i < n; i++) cells.push({ name: d.name, value: d.value });
		});

		// Remap cell index to grid position: row 0 = top, but we want to
		// read naturally left-to-right, top-to-bottom
		const waffleG = svg.append('g').attr('transform', `translate(${gridX}, ${gridY})`);

		let active = null;

		// Group cells by name so we can select entire groups
		const nameGroups = d3.group(
			cells.map((d, i) => ({ ...d, index: i })),
			(d) => d.name
		);

		data.forEach((datum) => {
			const groupCells = nameGroups.get(datum.name) || [];
			const fill = colorScale(datum.name);

			const yg = waffleG.append('g').attr('class', `waffle-group`).style('cursor', 'pointer');

			groupCells.forEach(({ index }) => {
				const col = index % cols;
				const row = Math.floor(index / cols);
				const x = col * cellSize;
				const y = row * cellSize;

				yg.append('rect')
					.attr('x', x)
					.attr('y', y)
					.attr('width', cellW)
					.attr('height', cellW)
					.attr('rx', rx)
					.attr('fill', fill)
					.attr('opacity', 0.88);
			});

			// Invisible hit rects over each cell for reliable touch/click
			groupCells.forEach(({ index }) => {
				const col = index % cols;
				const row = Math.floor(index / cols);
				yg.append('rect')
					.attr('x', col * cellSize)
					.attr('y', row * cellSize)
					.attr('width', cellSize)
					.attr('height', cellSize)
					.attr('fill', 'transparent');
			});

			yg.attr('role', 'button')
				.attr('tabindex', 0)
				.attr(
					'aria-label',
					`${datum.name}: ${datum.value.toLocaleString()} ${unitLabel}s, ` +
						`${((datum.value / total) * 100).toFixed(1)}% of total`
				)
				.on('click.waffle touchstart.waffle keydown.waffle', function (event) {
					if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
					if (event.type === 'keydown') event.preventDefault();
					event.stopPropagation();

					if (active === this) {
						reset();
					} else {
						active = this;
						waffleG.selectAll('g.waffle-group').style('opacity', 0.15);
						d3.select(this).style('opacity', 1);
						showBox(datum, fill);
					}
				});
		});

		function reset() {
			active = null;
			waffleG.selectAll('g.waffle-group').style('opacity', null);
			clearBox();
		}

		btnG.on('click.waffle touchstart.waffle keydown.waffle', function (event) {
			if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
			event.stopPropagation();
			reset();
		});

		svg.on('click.waffle touchstart.waffle', () => reset());

		// ── A11y table ────────────────────────────────────────────────────────────

		addA11yTable(svg.node(), {
			caption: `${title} — data table`,
			columns: [
				{ key: 'name', label: 'Region' },
				{ key: 'value', label: 'Total' },
				{ key: 'cells', label: `${unitLabel}s` },
				{ key: 'pct', label: 'Share' }
			],
			rows: data.map((d) => ({
				name: d.name,
				value: d.value.toLocaleString(),
				cells: Math.round(d.value / unit).toLocaleString(),
				pct: `${((d.value / total) * 100).toFixed(1)}%`
			}))
		});
	}
</script>

<div bind:this={container} style="position: relative; width: 100%; margin: 2rem 0;" />
