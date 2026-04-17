<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import * as topojson from 'topojson-client';
	import { colors, type, spacing, furniture } from '$lib/chartUtils/theme.js';
	import { createSvg, addFurniture, addA11yTable, createDataBox } from '$lib/chartUtils/utils.js';

	// --- Props ---
	export let subtitle = 'Western Europe pays twice as much as Eastern Europe per hour';
	export let title =
		'Day 17: Remake - Hourly labour costs 2025, in €, whole economy — enterprises with 10+ employees';
	export let source =
		'Eurostat, lc_lci_lev, 2025. Austria, Spain, Finland, Iceland: national sources. Malta: estimated from LCS2016. Belgium: 2024 estimates.';
	export let width = 960;
	export let height = 640;

	let container;

	const labourData = [
		{ iso: '352', name: 'Iceland', val: 59.3, region: 'Nordic' },
		{ iso: '578', name: 'Norway', val: 56.2, region: 'Nordic' },
		{ iso: '756', name: 'Switzerland', val: 56.8, region: 'Western' },
		{ iso: '442', name: 'Luxembourg', val: 51.7, region: 'Western' },
		{ iso: '528', name: 'Netherlands', val: 48.2, region: 'Western' },
		{ iso: '056', name: 'Belgium', val: 47.9, region: 'Western' },
		{ iso: '208', name: 'Denmark', val: 47.9, region: 'Nordic' },
		{ iso: '276', name: 'Germany', val: 45.0, region: 'Western' },
		{ iso: '250', name: 'France', val: 44.3, region: 'Western' },
		{ iso: '372', name: 'Ireland', val: 44.2, region: 'Western' },
		{ iso: '040', name: 'Austria', val: 46.3, region: 'Western' },
		{ iso: '752', name: 'Sweden', val: 43.1, region: 'Nordic' },
		{ iso: '246', name: 'Finland', val: 39.4, region: 'Nordic' },
		{ iso: '380', name: 'Italy', val: 32.0, region: 'Southern' },
		{ iso: '688', name: 'Serbia', val: 29.7, region: 'Eastern' },
		{ iso: '724', name: 'Spain', val: 26.4, region: 'Southern' },
		{ iso: '196', name: 'Cyprus', val: 21.7, region: 'Southern' },
		{ iso: '705', name: 'Slovenia', val: 21.1, region: 'Eastern' },
		{ iso: '440', name: 'Lithuania', val: 21.1, region: 'Eastern' },
		{ iso: '470', name: 'Malta', val: 19.0, region: 'Southern' },
		{ iso: '616', name: 'Poland', val: 19.1, region: 'Eastern' },
		{ iso: '620', name: 'Portugal', val: 19.4, region: 'Southern' },
		{ iso: '233', name: 'Estonia', val: 19.8, region: 'Eastern' },
		{ iso: '428', name: 'Latvia', val: 19.8, region: 'Eastern' },
		{ iso: '300', name: 'Greece', val: 18.4, region: 'Southern' },
		{ iso: '191', name: 'Croatia', val: 18.2, region: 'Eastern' },
		{ iso: '203', name: 'Czechia', val: 17.8, region: 'Eastern' },
		{ iso: '703', name: 'Slovakia', val: 16.3, region: 'Eastern' },
		{ iso: '348', name: 'Hungary', val: 15.2, region: 'Eastern' },
		{ iso: '642', name: 'Romania', val: 13.6, region: 'Eastern' },
		{ iso: '100', name: 'Bulgaria', val: 12.0, region: 'Eastern' }
	];

	const EU_AVG = 34.9;

	onMount(() => {
		draw();
	});

	async function draw() {
		if (!container) return;
		d3.select(container).selectAll('*').remove();

		// --- Layout ---
		// TITLE_H breakdown:
		//   title y=20, subtitle y=38, legend y=56 (bar+labels=24px), databox y=96
		//   Total header zone = 96 + ~36 (databox height) = ~132 → use 160 for comfort
		const TITLE_H = 160;
		const FOOTER_H = 30;
		const L = spacing.marginDefault.left;
		const R = spacing.marginDefault.right;
		const T = TITLE_H;
		const B = spacing.marginDefault.bottom + FOOTER_H;
		const chartW = width - L - R;
		const chartH = height - T - B;

		// --- SVG root ---
		const svg = createSvg(container, {
			width,
			height,
			ariaLabel: `${title} — choropleth map of Europe`
		});

		// --- Furniture (title + subtitle + source + byline) ---
		addFurniture(svg, { width, height, title, subtitle, source });

		// --- Legend at y=46 — sits between subtitle and databox ---
		const LEG_W = 160;
		const LEG_H = 10;
		const LEG_Y = 46;

		const defs = svg.append('defs');
		const grad = defs.append('linearGradient').attr('id', 'vl-labour-grad');
		grad.append('stop').attr('offset', '0%').attr('stop-color', colors.sagePale);
		grad.append('stop').attr('offset', '100%').attr('stop-color', colors.sageDark);

		const legG = svg.append('g').attr('transform', `translate(${L}, ${LEG_Y})`);

		legG
			.append('rect')
			.attr('width', LEG_W)
			.attr('height', LEG_H)
			.attr('rx', 2)
			.attr('fill', 'url(#vl-labour-grad)')
			.attr('stroke', colors.gridLine)
			.attr('stroke-width', 0.5);

		legG
			.append('text')
			.attr('x', 0)
			.attr('y', LEG_H + 12)
			.style('font-family', type.sans)
			.style('font-size', '11px')
			.style('fill', colors.warmGray)
			.text('€12 (Bulgaria)');

		legG
			.append('text')
			.attr('x', LEG_W)
			.attr('y', LEG_H + 12)
			.attr('text-anchor', 'end')
			.style('font-family', type.sans)
			.style('font-size', '11px')
			.style('fill', colors.warmGray)
			.text('€59 (Iceland)');

		// No-data swatch
		legG
			.append('rect')
			.attr('x', LEG_W + 20)
			.attr('y', 0)
			.attr('width', 14)
			.attr('height', LEG_H)
			.attr('rx', 2)
			.attr('fill', colors.gridLine)
			.attr('stroke', colors.gridLine)
			.attr('stroke-width', 0.5);

		legG
			.append('text')
			.attr('x', LEG_W + 38)
			.attr('y', 9)
			.style('font-family', type.sans)
			.style('font-size', '11px')
			.style('fill', colors.warmGray)
			.text('Data not available');

		legG
			.append('text')
			.attr('x', LEG_W + 38)
			.attr('y', LEG_H + 12)
			.style('font-family', type.sans)
			.style('font-size', '11px')
			.style('fill', colors.sageDark)
			.style('font-weight', type.medium)
			.text(`EU average: €${EU_AVG}/hr`);

		// --- DataBox at y=96 — below legend ---
		const box = createDataBox(svg, {
			width,
			fields: [
				{ key: 'country', label: 'COUNTRY' },
				{ key: 'cost', label: '€/HOUR' },
				{ key: 'region', label: 'REGION' },
				{ key: 'vsEU', label: 'VS EU AVG' }
			],
			y: 96,
			prompt: 'Hover a country to explore'
		});

		// --- Colour scale ---
		const colorScale = d3
			.scaleSequential()
			.domain([12, 60])
			.interpolator(d3.interpolateRgb(colors.sagePale, colors.sageDark));

		const byIso = Object.fromEntries(labourData.map((d) => [d.iso, d]));

		// --- Topology ---
		const world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
		const countries = topojson.feature(world, world.objects.countries);

		// --- Projection ---
		// Scaled down to 72% of chartW so the full continent fits with whitespace
		// Translate shifted right and down slightly to centre Europe in the chart area
		const proj = d3
			.geoConicConformal()
			.center([13, 52])
			.parallels([35, 65])
			.scale(chartW * 0.82)
			.translate([L + chartW * 0.44, T + chartH * 0.52]);

		const path = d3.geoPath(proj);

		// --- Clip path: constrain map to chart area ---
		defs
			.append('clipPath')
			.attr('id', 'vl-map-clip')
			.append('rect')
			.attr('x', L)
			.attr('y', T)
			.attr('width', chartW)
			.attr('height', chartH);

		// --- Map group (clipped) ---
		const g = svg.append('g').attr('class', 'vl-map').attr('clip-path', 'url(#vl-map-clip)');

		// Country fills
		g.selectAll('.vl-country-bg')
			.data(countries.features)
			.join('path')
			.attr('class', 'vl-country-bg')
			.attr('d', path)
			.attr('fill', (d) => {
				const isoKey = String(+d.id).toString().padStart(3, '0');
				const rec = byIso[isoKey];
				return rec ? colorScale(rec.val) : colors.gridLine;
			})
			.attr('stroke', colors.canvas)
			.attr('stroke-width', spacing.axisWidth);

		// Value labels inside each data country
		labourData.forEach((rec) => {
			const feature = countries.features.find(
				(f) => String(+f.id).toString().padStart(3, '0') === rec.iso
			);
			if (!feature) return;
			const centroid = path.centroid(feature);
			if (!centroid || isNaN(centroid[0])) return;
			// Skip labels outside the clip bounds
			if (
				centroid[0] < L ||
				centroid[0] > L + chartW ||
				centroid[1] < T ||
				centroid[1] > T + chartH
			)
				return;

			g.append('text')
				.attr('class', 'vl-map-label')
				.attr('x', centroid[0])
				.attr('y', centroid[1] + 3)
				.attr('text-anchor', 'middle')
				.style('font-family', type.sans)
				.style('font-size', '10px')
				.style('font-weight', type.medium)
				.style('fill', rec.val > 36 ? colors.canvas : colors.ink)
				.style('pointer-events', 'none')
				.text(rec.val.toFixed(1));
		});

		// Transparent hit-targets for hover (also clipped)
		g.selectAll('.vl-country-hit')
			.data(countries.features.filter((f) => !!byIso[String(+f.id).toString().padStart(3, '0')]))
			.join('path')
			.attr('class', 'vl-country-hit')
			.attr('d', path)
			.attr('fill', 'transparent')
			.attr('stroke', 'none')
			.style('cursor', 'pointer')
			.attr('role', 'button')
			.attr('tabindex', 0)
			.attr('aria-label', (d) => {
				const rec = byIso[String(+d.id).toString().padStart(3, '0')];
				return rec ? `${rec.name}: €${rec.val}/hr` : '';
			})
			.on('mouseenter focus', function (event, d) {
				const isoKey = String(+d.id).toString().padStart(3, '0');
				const rec = byIso[isoKey];
				if (!rec) return;
				const diff = (rec.val - EU_AVG).toFixed(1);
				const sign = rec.val >= EU_AVG ? '+' : '';
				box.show(
					{
						country: rec.name,
						cost: `€${rec.val.toFixed(1)}`,
						region: rec.region,
						vsEU: `${sign}${diff} vs €${EU_AVG}`
					},
					colorScale(rec.val)
				);
				g.selectAll('.vl-country-bg').attr('opacity', (f) =>
					String(+f.id).toString().padStart(3, '0') === isoKey ? 1 : 0.45
				);
			})
			.on('mouseleave blur', function () {
				box.clear();
				g.selectAll('.vl-country-bg').attr('opacity', 1);
			});

		// --- Accessibility table ---
		addA11yTable(svg.node(), {
			caption: `${title} — data table`,
			columns: [
				{ key: 'country', label: 'Country' },
				{ key: 'val', label: '€ per hour' },
				{ key: 'region', label: 'Region' },
				{ key: 'vsEU', label: 'Difference from EU avg' }
			],
			rows: labourData
				.sort((a, b) => b.val - a.val)
				.map((d) => ({
					country: d.name,
					val: `€${d.val.toFixed(1)}`,
					region: d.region,
					vsEU: `${d.val >= EU_AVG ? '+' : ''}${(d.val - EU_AVG).toFixed(1)}`
				}))
		});
	}
</script>

<div bind:this={container} style="position: relative; width: 100%; margin: 2rem 0;" />
