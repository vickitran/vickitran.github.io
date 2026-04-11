<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { colors, categorical, type, spacing } from '$lib/chartUtils/theme.js';
	import { addFurniture, addDataBox, addA11yTable } from '$lib/chartUtils/utils.js';

	// --- Props ---
	export let data = {
		name: 'root',
		children: [
			{ name: 'Category A', value: 320, group: 'Group 1' },
			{ name: 'Category B', value: 280, group: 'Group 1' },
			{ name: 'Category C', value: 210, group: 'Group 2' },
			{ name: 'Category D', value: 180, group: 'Group 2' },
			{ name: 'Category E', value: 140, group: 'Group 3' },
			{ name: 'Category F', value: 120, group: 'Group 3' },
			{ name: 'Category G', value: 90, group: 'Group 4' },
			{ name: 'Category H', value: 70, group: 'Group 4' },
			{ name: 'Category I', value: 50, group: 'Group 5' },
			{ name: 'Other', value: 40, group: 'Other' }
		]
	};
	export let title = 'Part-to-whole';
	export let subtitle = 'Your insight-first subtitle here — what should the reader notice?';
	export let source = 'Your source here';
	export let width = 960;
	export let height = 960;

	let container;

	onMount(() => {
		draw();
	});

	function draw() {
		if (!container || !data) return;

		// Clear any previous render
		d3.select(container).selectAll('*').remove();

		const TITLE_H = 110;
		const FOOTER_H = 28;
		const TILE_PAD = 2;

		const L = spacing.marginDefault.left;
		const R = spacing.marginDefault.left;
		const chartW = width - L - R;
		const chartH = height - TITLE_H - FOOTER_H - spacing.marginDefault.top;
		const total = d3.sum(data.children, (d) => d.value);

		const groups = Array.from(new Set(data.children.map((d) => d.group)));
		const colorScale = d3.scaleOrdinal().domain(groups).range(categorical);

		const root = d3
			.hierarchy(data)
			.sum((d) => d.value)
			.sort((a, b) => b.value - a.value);

		d3
			.treemap()
			.size([chartW, chartH])
			.padding(TILE_PAD)
			.paddingOuter(TILE_PAD * 2)
			.round(true)(root);

		const svg = d3
			.select(container)
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', `0 0 ${width} ${height}`)
			.attr('role', 'img')
			.attr('aria-label', `${title} — treemap chart`)
			.style('background', colors.canvas)
			.style('font-family', type.sans)
			.style('max-width', '100%')
			.style('height', 'auto');

		svg
			.append('defs')
			.append('clipPath')
			.attr('id', 'treemap-clip')
			.append('rect')
			.attr('width', chartW)
			.attr('height', chartH);

		addFurniture(svg, { width, height, title, subtitle, source });

		// Legend at y:52
		const legendG = svg
			.append('g')
			.attr('transform', `translate(${L}, 52)`)
			.attr('role', 'list')
			.attr('aria-label', 'Colour legend');

		const legendSpacing = Math.min(110, (chartW - 20) / groups.length);
		groups.forEach((grp, i) => {
			const lx = i * legendSpacing;
			if (lx + legendSpacing > chartW) return;
			const itemG = legendG.append('g').attr('role', 'listitem');
			itemG
				.append('rect')
				.attr('x', lx)
				.attr('y', 0)
				.attr('width', 10)
				.attr('height', 10)
				.attr('rx', 2)
				.attr('fill', colorScale(grp))
				.attr('aria-hidden', 'true');
			itemG
				.append('text')
				.attr('x', lx + 14)
				.attr('y', 9)
				.style('fill', colors.warmGray)
				.style('font-family', type.sans)
				.style('font-size', '11px')
				.text(grp);
		});

		// Data box at y:80
		const box = addDataBox(svg, {
			width,
			height,
			fields: ['name', 'group', 'value', 'pct'],
			total,
			y: 80
		});

		// Chart group
		const g = svg
			.append('g')
			.attr('transform', `translate(${L}, ${TITLE_H})`)
			.attr('clip-path', 'url(#treemap-clip)');

		const leaf = g
			.selectAll('g')
			.data(root.leaves())
			.join('g')
			.attr('transform', (d) => `translate(${d.x0},${d.y0})`);

		leaf
			.append('rect')
			.attr('width', (d) => d.x1 - d.x0)
			.attr('height', (d) => d.y1 - d.y0)
			.attr('rx', spacing.cornerRadius)
			.attr('fill', (d) => colorScale(d.data.group))
			.attr('opacity', 0.88);

		leaf.each(function (d) {
			const tileW = d.x1 - d.x0;
			const tileH = d.y1 - d.y0;
			if (tileW < 48 || tileH < 28) return;
			const node = d3.select(this);

			node
				.append('text')
				.attr('x', 6)
				.attr('y', 14)
				.attr('aria-hidden', 'true')
				.style('fill', colors.canvas)
				.style('font-family', type.sans)
				.style('font-size', `${Math.min(12, tileW / 6)}px`)
				.style('font-weight', 500)
				.text(() => {
					const maxChars = Math.floor(tileW / 7);
					return d.data.name.length > maxChars
						? d.data.name.slice(0, maxChars - 1) + '…'
						: d.data.name;
				});

			if (tileH >= 40) {
				node
					.append('text')
					.attr('x', 6)
					.attr('y', 28)
					.attr('aria-hidden', 'true')
					.style('fill', colors.canvas)
					.style('font-family', type.sans)
					.style('font-size', '11px')
					.style('opacity', 0.8)
					.text(d.data.value.toLocaleString());
			}
		});

		box.bind(
			leaf,
			(d) => d.data,
			(d) => colorScale(d.data.group)
		);

		addA11yTable(svg.node(), {
			caption: `${title} — data table`,
			columns: [
				{ key: 'name', label: 'Name' },
				{ key: 'group', label: 'Group' },
				{ key: 'value', label: 'Value' },
				{ key: 'pct', label: 'Share' }
			],
			rows: data.children.map((d) => ({
				name: d.name,
				group: d.group,
				value: d.value.toLocaleString(),
				pct: `${((d.value / total) * 100).toFixed(1)}%`
			}))
		});
	}
</script>

<div bind:this={container} style="position: relative; width: 100%; margin: 2rem 0;" />
