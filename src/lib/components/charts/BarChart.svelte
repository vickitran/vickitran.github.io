<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { colors, categorical, type, spacing } from '$lib/chartUtils/theme.js';
	import { createSvg, addFurniture, addA11yTable, createDataBox } from '$lib/chartUtils/utils.js';

	// --- Props ---
	export let data;

	/**
	 * categoryKey  — field name used as the x-axis category (e.g. 'quarter', 'month', 'country')
	 * groupKey     — field name used to group/colour bars within each category (e.g. 'group', 'region')
	 * valueKey     — field name for the numerical y-axis value
	 *
	 * Set xAxisType to 'numerical' to render the x-axis with a linear scale instead of a band scale.
	 * In that case categoryKey should contain numeric values.
	 */
	export let categoryKey = 'quarter';
	export let groupKey = 'group';
	export let valueKey = 'value';
	export let xAxisType = 'categorical'; // 'categorical' | 'numerical'

	export let title = 'Regional revenue by quarter';
	export let subtitle = 'Grouped bars — categorical x-axis, numerical y-axis';
	export let source = 'Internal sales data';
	export let width = 960;
	export let height = 560;

	let container;

	onMount(() => {
		draw();
	});

	function draw() {
		if (!container || !data || !data.length) return;

		d3.select(container).selectAll('*').remove();

		// --- Layout constants ---
		const TITLE_H = 136;
		const FOOTER_H = 30;
		const L = spacing.marginDefault.left;
		const R = spacing.marginDefault.right;
		const T = TITLE_H;
		const B = spacing.marginDefault.bottom + FOOTER_H;

		const chartW = width - L - R;
		const chartH = height - T - B;

		// --- ISO 2-letter country code map ---
		const isoMap = {
			Austria: 'AT',
			Belgium: 'BE',
			Bulgaria: 'BG',
			Croatia: 'HR',
			Cyprus: 'CY',
			Czechia: 'CZ',
			Denmark: 'DK',
			Estonia: 'EE',
			Finland: 'FI',
			France: 'FR',
			Germany: 'DE',
			Greece: 'GR',
			Hungary: 'HU',
			Iceland: 'IS',
			Ireland: 'IE',
			Italy: 'IT',
			Latvia: 'LV',
			Lithuania: 'LT',
			Luxembourg: 'LU',
			Malta: 'MT',
			Netherlands: 'NL',
			Norway: 'NO',
			Poland: 'PL',
			Portugal: 'PT',
			Romania: 'RO',
			Serbia: 'RS',
			Slovakia: 'SK',
			Slovenia: 'SI',
			Spain: 'ES',
			Sweden: 'SE',
			Türkiye: 'TR',
			'United Kingdom': 'GB',
			'European Union - 27 countries (from 2020)': 'EU27',
			'European Union - 28 countries (2013-2020)': 'EU28'
		};

		// --- Derived data ---
		// Sort categories by highest 2019 value descending, then fallback to max value
		const groups = Array.from(new Set(data.map((d) => d[groupKey])));
		const latestGroup = groups[groups.length - 1]; // last group = most recent year
		const valueByCategory = {};
		data.forEach((d) => {
			if (!valueByCategory[d[categoryKey]]) valueByCategory[d[categoryKey]] = {};
			valueByCategory[d[categoryKey]][d[groupKey]] = d[valueKey];
		});
		const allCategories = Array.from(new Set(data.map((d) => d[categoryKey])));
		const categories = allCategories.sort((a, b) => {
			const va = valueByCategory[a][latestGroup] ?? d3.max(Object.values(valueByCategory[a]));
			const vb = valueByCategory[b][latestGroup] ?? d3.max(Object.values(valueByCategory[b]));
			return vb - va;
		});
		const total = d3.sum(data, (d) => d[valueKey]);

		const colorScale = d3.scaleOrdinal().domain(groups).range(categorical);

		// --- Scales ---
		let x0;
		if (xAxisType === 'numerical') {
			const extent = d3.extent(data, (d) => +d[categoryKey]);
			x0 = d3.scaleLinear().domain(extent).range([0, chartW]);
		} else {
			x0 = d3
				.scaleBand()
				.domain(categories)
				.range([0, chartW])
				.paddingInner(0.28)
				.paddingOuter(0.12);
		}

		const x1 = d3
			.scaleBand()
			.domain(groups)
			.range([0, xAxisType === 'numerical' ? chartW / categories.length : x0.bandwidth()])
			.padding(0.08);

		const yMax = d3.max(data, (d) => d[valueKey]);
		const y = d3
			.scaleLinear()
			.domain([0, Math.ceil(yMax / 100) * 100])
			.range([chartH, 0])
			.nice();

		// --- SVG root ---
		const svg = createSvg(container, { width, height, ariaLabel: `${title} — grouped bar chart` });

		// --- Furniture: title, subtitle, source, byline ---
		addFurniture(svg, { width, height, title, subtitle, source });

		// --- Legend ---
		const legendG = svg
			.append('g')
			.attr('transform', `translate(${L}, 58)`)
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

		// --- Databox ---
		const box = createDataBox(svg, {
			width,
			fields: [
				{ key: categoryKey, label: categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1) },
				{ key: groupKey, label: groupKey.charAt(0).toUpperCase() + groupKey.slice(1) },
				{ key: 'value', label: 'Value' },
				{ key: 'pct', label: 'Share' }
			],
			y: 86,
			prompt: 'Tap a bar to explore'
		});

		// --- Chart group ---
		const g = svg.append('g').attr('transform', `translate(${L}, ${T})`);

		// Grid lines
		const yTicks = y.ticks(5);
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

		// X axis
		const xAxis =
			xAxisType === 'numerical'
				? d3.axisBottom(x0).tickSize(0).tickPadding(spacing.labelPad)
				: d3.axisBottom(x0).tickSize(0).tickPadding(spacing.labelPad);

		g.append('g')
			.attr('transform', `translate(0, ${chartH})`)
			.call(xAxis)
			.call((ax) => ax.select('.domain').remove())
			.selectAll('text')
			.style('font-family', type.sans)
			.style('font-size', `${type.axisLabel}px`)
			.style('fill', colors.warmGray)
			.text((d) => isoMap[d] ?? d);

		// Y axis
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

		// --- Bars ---
		const catGroups = g
			.selectAll('.vl-cat-group')
			.data(categories)
			.join('g')
			.attr('class', 'vl-cat-group')
			.attr('transform', (cat) => {
				if (xAxisType === 'numerical') {
					const bw = x0(+categories[1]) - x0(+categories[0]);
					return `translate(${x0(+cat) - bw / 2}, 0)`;
				}
				return `translate(${x0(cat)}, 0)`;
			});

		const barWidth =
			xAxisType === 'numerical'
				? (x0(+categories[1]) - x0(+categories[0])) / groups.length
				: x1.bandwidth();

		const leaf = catGroups
			.selectAll('.vl-bar')
			.data((cat) => data.filter((d) => d[categoryKey] === cat))
			.join('g')
			.attr('class', 'vl-bar')
			.attr('transform', (d) => `translate(${x1(d[groupKey])}, 0)`);

		const barRects = leaf
			.append('rect')
			.attr('x', 0)
			.attr('y', (d) => y(d[valueKey]))
			.attr('width', xAxisType === 'numerical' ? barWidth : x1.bandwidth())
			.attr('height', (d) => chartH - y(d[valueKey]))
			.attr('rx', spacing.cornerRadius)
			.attr('fill', (d) => colorScale(d[groupKey]))
			.attr('opacity', 0.88);

		// --- Wire DataBox to bars ---
		let activeBar = null;

		function clearSelection() {
			activeBar = null;
			barRects.attr('opacity', 0.88);
			box.clear();
		}

		barRects
			.attr('role', 'button')
			.attr('tabindex', 0)
			.attr('aria-label', (d) => `${d[categoryKey]} · ${d[groupKey]}: ${d[valueKey].toLocaleString()}`)
			.style('cursor', 'pointer')
			.on('click.databox touchstart.databox keydown.databox', function (event, d) {
				if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
				if (event.type === 'touchstart') event.preventDefault();
				event.stopPropagation();

				const isSame = activeBar === this;
				clearSelection();
				if (isSame) return;

				activeBar = this;
				barRects.attr('opacity', 0.25);
				d3.select(this).attr('opacity', 1);

				const pct = `${((d[valueKey] / total) * 100).toFixed(1)}%`;
				box.show(
					{
						[categoryKey]: d[categoryKey],
						[groupKey]: d[groupKey],
						value: d[valueKey].toLocaleString(),
						pct
					},
					colorScale(d[groupKey])
				);
			});

		svg.on('click.databox touchstart.databox', clearSelection);

		box.btnG.on('click.databox touchstart.databox keydown.databox', function (event) {
			if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
			event.stopPropagation();
			clearSelection();
		});

		// --- Accessibility table ---
		addA11yTable(svg.node(), {
			caption: `${title} — data table`,
			columns: [
				{ key: categoryKey, label: categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1) },
				{ key: groupKey, label: groupKey.charAt(0).toUpperCase() + groupKey.slice(1) },
				{ key: 'value', label: 'Value' },
				{ key: 'pct', label: 'Share' }
			],
			rows: data.map((d) => ({
				[categoryKey]: d[categoryKey],
				[groupKey]: d[groupKey],
				value: d[valueKey].toLocaleString(),
				pct: `${((d[valueKey] / total) * 100).toFixed(1)}%`
			}))
		});
	}
</script>

<div bind:this={container} style="position: relative; width: 100%; margin: 2rem 0;" />
