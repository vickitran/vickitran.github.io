<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { colors, type, spacing } from '$lib/chartUtils/theme.js';
	import { createSvg, addFurniture, addA11yTable, createDataBox } from '$lib/chartUtils/utils.js';

	// --- Props ---
	export let title = 'Day 15: Correlation - Live births per 1,000 people in China';
	export let subtitle =
		' The last two Dragon Years (2012 & 2024) experienced a higher birth rate than expected';
	export let source = 'World Bank / FRED (SPDYNCBRTINCHN); NBS China (2024 est.)';
	export let width = 960;
	export let height = 600;

	let container;

	// --- Data: World Bank crude birth rate per 1,000, 1980–2024 ---
	const rawData = [
		{ year: 1980, rate: 18.21 },
		{ year: 1981, rate: 20.91 },
		{ year: 1982, rate: 22.28 },
		{ year: 1983, rate: 20.19 },
		{ year: 1984, rate: 19.9 },
		{ year: 1985, rate: 21.04 },
		{ year: 1986, rate: 22.43 },
		{ year: 1987, rate: 23.33 },
		{ year: 1988, rate: 22.37 }, // dragon
		{ year: 1989, rate: 21.58 },
		{ year: 1990, rate: 21.06 },
		{ year: 1991, rate: 19.68 },
		{ year: 1992, rate: 18.27 },
		{ year: 1993, rate: 18.09 },
		{ year: 1994, rate: 17.7 },
		{ year: 1995, rate: 17.12 },
		{ year: 1996, rate: 16.98 },
		{ year: 1997, rate: 16.57 },
		{ year: 1998, rate: 15.64 },
		{ year: 1999, rate: 14.64 },
		{ year: 2000, rate: 14.03 }, // dragon
		{ year: 2001, rate: 13.38 },
		{ year: 2002, rate: 12.86 },
		{ year: 2003, rate: 12.41 },
		{ year: 2004, rate: 12.29 },
		{ year: 2005, rate: 12.4 },
		{ year: 2006, rate: 12.09 },
		{ year: 2007, rate: 12.1 },
		{ year: 2008, rate: 12.14 },
		{ year: 2009, rate: 11.95 },
		{ year: 2010, rate: 11.9 },
		{ year: 2011, rate: 13.27 },
		{ year: 2012, rate: 14.57 }, // dragon
		{ year: 2013, rate: 13.03 },
		{ year: 2014, rate: 13.83 },
		{ year: 2015, rate: 11.99 },
		{ year: 2016, rate: 13.57 },
		{ year: 2017, rate: 12.64 },
		{ year: 2018, rate: 10.86 },
		{ year: 2019, rate: 10.41 },
		{ year: 2020, rate: 8.52 },
		{ year: 2021, rate: 7.52 },
		{ year: 2022, rate: 6.77 },
		{ year: 2023, rate: 6.39 },
		{ year: 2024, rate: 6.77 } // dragon — NBS China estimate
	];

	const DRAGON_YEARS = new Set([1988, 2000, 2012, 2024]);

	// Avg annual % change over prior 11 non-dragon years, applied to year-1
	function computeCounterfactual(dragonYear) {
		const rateByYear = Object.fromEntries(rawData.map((d) => [d.year, d.rate]));
		const changes = [];
		for (let yr = dragonYear - 11; yr < dragonYear; yr++) {
			if (DRAGON_YEARS.has(yr)) continue;
			const prev = rateByYear[yr - 1];
			const curr = rateByYear[yr];
			if (prev != null && curr != null && prev > 0) {
				changes.push((curr - prev) / prev);
			}
		}
		const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
		const baseline = rateByYear[dragonYear - 1];
		return parseFloat((baseline * (1 + avgChange)).toFixed(2));
	}

	const data = rawData.map((d) => ({
		...d,
		dragon: DRAGON_YEARS.has(d.year),
		counterfactual: DRAGON_YEARS.has(d.year) ? computeCounterfactual(d.year) : null
	}));

	onMount(() => {
		draw();
	});

	function draw() {
		if (!container || !data.length) return;
		d3.select(container).selectAll('*').remove();

		// --- Layout ---
		// TITLE_H: title(20) + subtitle(40) + legend(18) + databox zone(46) + gaps = 136
		const TITLE_H = 136;
		const FOOTER_H = 30;
		const L = spacing.marginDefault.left;
		const R = spacing.marginDefault.right;
		const T = TITLE_H;
		const B = spacing.marginDefault.bottom + FOOTER_H;
		const chartW = width - L - R;
		const chartH = height - T - B;

		// --- Scales ---
		const years = data.map((d) => d.year);

		const x = d3.scaleBand().domain(years).range([0, chartW]).padding(0.18);

		const yMax = d3.max(data, (d) => d.rate) * 1.08;
		const y = d3.scaleLinear().domain([0, yMax]).range([chartH, 0]).nice();

		const yTicks = y.ticks(6);

		// --- SVG root ---
		const svg = createSvg(container, {
			width,
			height,
			ariaLabel: `${title} — bar chart with counterfactual overlay`
		});

		// --- Furniture ---
		addFurniture(svg, { width, height, title, subtitle, source });

		// --- Legend (y=58, below subtitle) ---
		const legendG = svg
			.append('g')
			.attr('transform', `translate(${L}, 58)`)
			.attr('role', 'list')
			.attr('aria-label', 'Chart legend');

		const legendItems = [
			{ fill: colors.roseDark, stroke: null, label: 'Year of the dragon' },
			{ fill: colors.sageDark, stroke: null, label: 'Non-dragon year' },
			{
				fill: 'none',
				stroke: colors.roseDark,
				label: 'Expected rate (no dragon effect)',
				diamond: true
			}
		];

		let lx = 0;
		legendItems.forEach((item) => {
			const itemG = legendG
				.append('g')
				.attr('role', 'listitem')
				.attr('transform', `translate(${lx}, 0)`);

			if (item.diamond) {
				itemG
					.append('path')
					.attr('d', d3.symbol().type(d3.symbolDiamond).size(56)())
					.attr('transform', 'translate(5, 5)')
					.attr('fill', item.fill)
					.attr('stroke', item.stroke)
					.attr('stroke-width', 1.5)
					.attr('aria-hidden', 'true');
			} else {
				itemG
					.append('rect')
					.attr('width', 10)
					.attr('height', 10)
					.attr('rx', 2)
					.attr('fill', item.fill)
					.attr('aria-hidden', 'true');
			}

			itemG
				.append('text')
				.attr('x', 14)
				.attr('y', 9)
				.style('font-family', type.sans)
				.style('font-size', '11px')
				.style('fill', colors.warmGray)
				.text(item.label);

			lx += itemG.node().getBBox().width + 20;
		});

		// --- DataBox (y=86, between legend and chart) ---
		const box = createDataBox(svg, {
			width,
			fields: [
				{ key: 'year', label: 'YEAR' },
				{ key: 'rate', label: 'BIRTH RATE' },
				{ key: 'dragon', label: 'DRAGON YEAR' },
				{ key: 'counterfactual', label: 'EXPECTED RATE' }
			],
			y: 86,
			prompt: 'Tap a bar to explore'
		});

		// --- Chart group ---
		const g = svg.append('g').attr('transform', `translate(${L}, ${T})`);

		// Grid lines
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

		// --- Bars ---
		// Non-dragon: roseLight (#F4A8B8) — light pink, fills only, correct token
		// Dragon:     roseDark (#A8324A)  — deep rose, AAA contrast, accent colour
		const bars = g
			.selectAll('.vl-bar')
			.data(data)
			.join('rect')
			.attr('class', 'vl-bar')
			.attr('x', (d) => x(d.year))
			.attr('y', (d) => y(d.rate))
			.attr('width', x.bandwidth())
			.attr('height', (d) => chartH - y(d.rate))
			.attr('rx', spacing.cornerRadius)
			.attr('fill', (d) => (d.dragon ? colors.roseDark : colors.sageDark))
			.attr('opacity', 0.88)
			.style('cursor', 'pointer');

		// --- Counterfactual overlays (non-interactive) ---
		const dragonData = data.filter((d) => d.dragon && d.counterfactual != null);

		// Dashed line at counterfactual level spanning the bar
		g.selectAll('.vl-cf-line')
			.data(dragonData)
			.join('line')
			.attr('class', 'vl-cf-line')
			.attr('x1', (d) => x(d.year) - 2)
			.attr('x2', (d) => x(d.year) + x.bandwidth() + 2)
			.attr('y1', (d) => y(d.counterfactual))
			.attr('y2', (d) => y(d.counterfactual))
			.attr('stroke', colors.ink)
			.attr('stroke-width', spacing.strokeWidth)
			.attr('stroke-dasharray', '3,2')
			.attr('pointer-events', 'none');

		// Diamond marker at bar midpoint on counterfactual line
		g.selectAll('.vl-cf-diamond')
			.data(dragonData)
			.join('path')
			.attr('class', 'vl-cf-diamond')
			.attr('d', d3.symbol().type(d3.symbolDiamond).size(52)())
			.attr(
				'transform',
				(d) => `translate(${x(d.year) + x.bandwidth() / 2}, ${y(d.counterfactual)})`
			)
			.attr('fill', colors.canvas)
			.attr('stroke', colors.roseDark)
			.attr('stroke-width', 1.5)
			.attr('pointer-events', 'none');

		// Small label above counterfactual line
		g.selectAll('.vl-cf-label')
			.data(dragonData)
			.join('text')
			.attr('class', 'vl-cf-label')
			.attr('x', (d) => x(d.year) + x.bandwidth() / 2)
			.attr('y', (d) => y(d.counterfactual) - 7)
			.attr('text-anchor', 'middle')
			.style('font-family', type.sans)
			.style('font-size', '10px')
			.style('fill', colors.warmGray)
			.attr('pointer-events', 'none');

		// --- X axis (every 5 years) ---
		g.append('g')
			.attr('transform', `translate(0, ${chartH})`)
			.call(
				d3
					.axisBottom(x)
					.tickValues(years.filter((yr) => yr % 5 === 0))
					.tickSize(0)
					.tickPadding(spacing.labelPad)
					.tickFormat((yr) => `'${String(yr).slice(2)}`)
			)
			.call((ax) => ax.select('.domain').remove())
			.selectAll('text')
			.style('font-family', type.sans)
			.style('font-size', `${type.axisLabel}px`)
			.style('fill', colors.warmGray);

		// --- Y axis ---
		g.append('g')
			.call(
				d3
					.axisLeft(y)
					.tickValues(yTicks)
					.tickSize(0)
					.tickPadding(spacing.labelPad)
					.tickFormat((v) => v)
			)
			.call((ax) => ax.select('.domain').remove())
			.selectAll('text')
			.style('font-family', type.sans)
			.style('font-size', `${type.axisLabel}px`)
			.style('fill', colors.warmGray);

		// --- Wire DataBox interactions ---
		let activeBar = null;

		function clearSelection() {
			activeBar = null;
			bars.style('opacity', 0.88);
			box.clear();
		}

		bars
			.attr('role', 'button')
			.attr('tabindex', 0)
			.attr(
				'aria-label',
				(d) =>
					`${d.year}${d.dragon ? ' (dragon year)' : ''}, birth rate ${d.rate.toFixed(
						2
					)} per 1,000` + (d.counterfactual ? `, expected ${d.counterfactual.toFixed(2)}` : '')
			)
			.on('click.databox touchstart.databox keydown.databox', function (event, d) {
				if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
				if (event.type === 'touchstart') event.preventDefault();
				event.stopPropagation();

				const isSame = activeBar === this;
				clearSelection();
				if (isSame) return;

				activeBar = this;
				bars.style('opacity', 0.3);
				d3.select(this).style('opacity', 1);

				box.show(
					{
						year: String(d.year),
						rate: `${d.rate.toFixed(2)} per 1,000`,
						dragon: d.dragon ? 'Yes' : 'No',
						counterfactual:
							d.counterfactual != null ? `${d.counterfactual.toFixed(2)} per 1,000` : '—'
					},
					d.dragon ? colors.roseDark : colors.warmGray
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
				{ key: 'year', label: 'Year' },
				{ key: 'rate', label: 'Birth rate (per 1,000)' },
				{ key: 'dragon', label: 'Dragon year' },
				{ key: 'counterfactual', label: 'Expected rate (counterfactual)' }
			],
			rows: data.map((d) => ({
				year: d.year,
				rate: d.rate.toFixed(2),
				dragon: d.dragon ? 'Yes' : 'No',
				counterfactual: d.counterfactual != null ? d.counterfactual.toFixed(2) : '—'
			}))
		});
	}
</script>

<div bind:this={container} style="position: relative; width: 100%; margin: 2rem 0;" />
