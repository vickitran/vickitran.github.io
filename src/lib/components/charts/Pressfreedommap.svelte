<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { colors, type, spacing } from '$lib/chartUtils/theme.js';
	import { addFurniture, addDataBox } from '$lib/chartUtils/utils.js';

	// ---------------------------------------------------------------------------
	// Props
	// ---------------------------------------------------------------------------
	export let title = 'World Press Freedom Index 2025';
	export let subtitle =
		'RSF score per country (0–100, higher = more freedom). Hover to explore · click to pin.';
	export let source = 'Reporters Without Borders (RSF) — rsf.org/en/index';
	export let width = 960;
	export let height = 560;

	// ---------------------------------------------------------------------------
	// RSF 2025 scores — ISO 3166-1 alpha-3
	// Source: rsf.org/en/index, May 2025 edition
	// ---------------------------------------------------------------------------
	const RSF = {
		AFG: { name: 'Afghanistan', score: 40.72 },
		ALB: { name: 'Albania', score: 63.28 },
		DZA: { name: 'Algeria', score: 47.98 },
		AGO: { name: 'Angola', score: 44.1 },
		ARG: { name: 'Argentina', score: 66.49 },
		ARM: { name: 'Armenia', score: 70.79 },
		AUS: { name: 'Australia', score: 78.49 },
		AUT: { name: 'Austria', score: 80.2 },
		AZE: { name: 'Azerbaijan', score: 46.89 },
		BHS: { name: 'Bahamas', score: 69.22 },
		BHR: { name: 'Bahrain', score: 36.28 },
		BGD: { name: 'Bangladesh', score: 50.28 },
		BLR: { name: 'Belarus', score: 46.54 },
		BEL: { name: 'Belgium', score: 79.46 },
		BLZ: { name: 'Belize', score: 56.04 },
		BEN: { name: 'Benin', score: 53.62 },
		BOL: { name: 'Bolivia', score: 61.41 },
		BIH: { name: 'Bosnia and Herzegovina', score: 60.74 },
		BWA: { name: 'Botswana', score: 70.89 },
		BRA: { name: 'Brazil', score: 58.12 },
		BRN: { name: 'Brunei', score: 39.61 },
		BGR: { name: 'Bulgaria', score: 69.3 },
		BFA: { name: 'Burkina Faso', score: 52.41 },
		BDI: { name: 'Burundi', score: 30.88 },
		CPV: { name: 'Cape Verde', score: 75.13 },
		KHM: { name: 'Cambodia', score: 44.05 },
		CMR: { name: 'Cameroon', score: 45.14 },
		CAN: { name: 'Canada', score: 81.28 },
		CAF: { name: 'Central African Republic', score: 37.76 },
		TCD: { name: 'Chad', score: 35.17 },
		CHL: { name: 'Chile', score: 77.87 },
		CHN: { name: 'China', score: 14.8 },
		COL: { name: 'Colombia', score: 48.76 },
		COM: { name: 'Comoros', score: 52.98 },
		COG: { name: 'Republic of Congo', score: 52.15 },
		COD: { name: 'DR Congo', score: 58.82 },
		CRI: { name: 'Costa Rica', score: 75.44 },
		CIV: { name: 'Ivory Coast', score: 54.82 },
		HRV: { name: 'Croatia', score: 71.8 },
		CUB: { name: 'Cuba', score: 38.13 },
		CYP: { name: 'Cyprus', score: 68.19 },
		CZE: { name: 'Czech Republic', score: 83.96 },
		DNK: { name: 'Denmark', score: 86.93 },
		DJI: { name: 'Djibouti', score: 30.39 },
		DOM: { name: 'Dominican Republic', score: 54.67 },
		ECU: { name: 'Ecuador', score: 62.39 },
		EGY: { name: 'Egypt', score: 42.94 },
		SLV: { name: 'El Salvador', score: 63.46 },
		GNQ: { name: 'Equatorial Guinea', score: 30.75 },
		ERI: { name: 'Eritrea', score: 12.27 },
		EST: { name: 'Estonia', score: 89.46 },
		ETH: { name: 'Ethiopia', score: 34.8 },
		FJI: { name: 'Fiji', score: 59.76 },
		FIN: { name: 'Finland', score: 87.18 },
		FRA: { name: 'France', score: 76.47 },
		GAB: { name: 'Gabon', score: 45.51 },
		GMB: { name: 'Gambia', score: 54.0 },
		GEO: { name: 'Georgia', score: 61.69 },
		DEU: { name: 'Germany', score: 78.02 },
		GHA: { name: 'Ghana', score: 73.65 },
		GRC: { name: 'Greece', score: 66.96 },
		GTM: { name: 'Guatemala', score: 56.37 },
		GIN: { name: 'Guinea', score: 50.97 },
		GNB: { name: 'Guinea-Bissau', score: 54.1 },
		GUY: { name: 'Guyana', score: 60.28 },
		HTI: { name: 'Haiti', score: 35.54 },
		HND: { name: 'Honduras', score: 57.67 },
		HUN: { name: 'Hungary', score: 67.1 },
		ISL: { name: 'Iceland', score: 77.27 },
		IND: { name: 'India', score: 46.18 },
		IDN: { name: 'Indonesia', score: 49.38 },
		IRN: { name: 'Iran', score: 39.24 },
		IRQ: { name: 'Iraq', score: 42.57 },
		IRL: { name: 'Ireland', score: 84.19 },
		ISR: { name: 'Israel', score: 52.63 },
		ITA: { name: 'Italy', score: 68.81 },
		JAM: { name: 'Jamaica', score: 76.31 },
		JPN: { name: 'Japan', score: 72.22 },
		JOR: { name: 'Jordan', score: 35.68 },
		KAZ: { name: 'Kazakhstan', score: 47.21 },
		KEN: { name: 'Kenya', score: 65.32 },
		PRK: { name: 'North Korea', score: 12.64 },
		KOR: { name: 'South Korea', score: 71.54 },
		KWT: { name: 'Kuwait', score: 60.62 },
		KGZ: { name: 'Kyrgyzstan', score: 52.79 },
		LAO: { name: 'Laos', score: 35.91 },
		LVA: { name: 'Latvia', score: 77.31 },
		LBN: { name: 'Lebanon', score: 28.28 },
		LSO: { name: 'Lesotho', score: 53.45 },
		LBR: { name: 'Liberia', score: 60.05 },
		LBY: { name: 'Libya', score: 44.78 },
		LTU: { name: 'Lithuania', score: 81.72 },
		LUX: { name: 'Luxembourg', score: 83.83 },
		MDG: { name: 'Madagascar', score: 58.3 },
		MWI: { name: 'Malawi', score: 63.72 },
		MYS: { name: 'Malaysia', score: 43.31 },
		MDV: { name: 'Maldives', score: 37.02 },
		MLI: { name: 'Mali', score: 45.62 },
		MLT: { name: 'Malta', score: 56.84 },
		MRT: { name: 'Mauritania', score: 51.43 },
		MUS: { name: 'Mauritius', score: 67.66 },
		MEX: { name: 'Mexico', score: 55.75 },
		MDA: { name: 'Moldova', score: 70.66 },
		MNG: { name: 'Mongolia', score: 50.52 },
		MNE: { name: 'Montenegro', score: 55.16 },
		MAR: { name: 'Morocco', score: 43.68 },
		MOZ: { name: 'Mozambique', score: 49.65 },
		MMR: { name: 'Myanmar', score: 41.09 },
		NAM: { name: 'Namibia', score: 54.46 },
		NPL: { name: 'Nepal', score: 55.92 },
		NLD: { name: 'Netherlands', score: 88.64 },
		NZL: { name: 'New Zealand', score: 79.16 },
		NIC: { name: 'Nicaragua', score: 67.77 },
		NER: { name: 'Niger', score: 48.42 },
		NGA: { name: 'Nigeria', score: 51.78 },
		MKD: { name: 'North Macedonia', score: 63.86 },
		NOR: { name: 'Norway', score: 92.31 },
		OMN: { name: 'Oman', score: 28.65 },
		PAK: { name: 'Pakistan', score: 41.83 },
		PAN: { name: 'Panama', score: 67.44 },
		PNG: { name: 'Papua New Guinea', score: 58.41 },
		PRY: { name: 'Paraguay', score: 65.62 },
		PER: { name: 'Peru', score: 57.44 },
		PHL: { name: 'Philippines', score: 56.92 },
		POL: { name: 'Poland', score: 74.54 },
		PRT: { name: 'Portugal', score: 84.17 },
		QAT: { name: 'Qatar', score: 58.48 },
		ROU: { name: 'Romania', score: 53.84 },
		RUS: { name: 'Russia', score: 42.2 },
		RWA: { name: 'Rwanda', score: 38.5 },
		SAU: { name: 'Saudi Arabia', score: 37.39 },
		SEN: { name: 'Senegal', score: 69.56 },
		SRB: { name: 'Serbia', score: 64.9 },
		SLE: { name: 'Sierra Leone', score: 30.02 },
		SGP: { name: 'Singapore', score: 46.32 },
		SVK: { name: 'Slovakia', score: 78.2 },
		SVN: { name: 'Slovenia', score: 81.65 },
		SOM: { name: 'Somalia', score: 41.46 },
		ZAF: { name: 'South Africa', score: 72.06 },
		SSD: { name: 'South Sudan', score: 38.87 },
		ESP: { name: 'Spain', score: 75.76 },
		LKA: { name: 'Sri Lanka', score: 67.94 },
		SDN: { name: 'Sudan', score: 53.19 },
		SUR: { name: 'Suriname', score: 72.76 },
		SWZ: { name: 'Eswatini', score: 49.12 },
		SWE: { name: 'Sweden', score: 88.13 },
		CHE: { name: 'Switzerland', score: 84.01 },
		SYR: { name: 'Syria', score: 32.95 },
		TWN: { name: 'Taiwan', score: 71.35 },
		TJK: { name: 'Tajikistan', score: 47.63 },
		TZA: { name: 'Tanzania', score: 64.34 },
		THA: { name: 'Thailand', score: 48.22 },
		TLS: { name: 'Timor-Leste', score: 62.84 },
		TGO: { name: 'Togo', score: 59.88 },
		TTO: { name: 'Trinidad and Tobago', score: 70.41 },
		TUN: { name: 'Tunisia', score: 61.96 },
		TUR: { name: 'Turkey', score: 44.41 },
		TKM: { name: 'Turkmenistan', score: 33.69 },
		UGA: { name: 'Uganda', score: 59.43 },
		UKR: { name: 'Ukraine', score: 65.99 },
		ARE: { name: 'UAE', score: 34.06 },
		GBR: { name: 'United Kingdom', score: 77.82 },
		USA: { name: 'United States', score: 57.18 },
		URY: { name: 'Uruguay', score: 76.64 },
		UZB: { name: 'Uzbekistan', score: 33.32 },
		VEN: { name: 'Venezuela', score: 49.87 },
		VNM: { name: 'Vietnam', score: 52.0 },
		PSE: { name: 'Palestine', score: 36.65 },
		YEM: { name: 'Yemen', score: 34.43 },
		ZMB: { name: 'Zambia', score: 60.37 },
		ZWE: { name: 'Zimbabwe', score: 55.67 }
	};

	// ISO alpha-3 → world-atlas numeric topology ID
	const ISO3_NUM = {
		AFG: 4,
		ALB: 8,
		DZA: 12,
		AGO: 24,
		ARG: 32,
		ARM: 51,
		AUS: 36,
		AUT: 40,
		AZE: 31,
		BHS: 44,
		BHR: 48,
		BGD: 50,
		BLR: 112,
		BEL: 56,
		BLZ: 84,
		BEN: 204,
		BOL: 68,
		BIH: 70,
		BWA: 72,
		BRA: 76,
		BRN: 96,
		BGR: 100,
		BFA: 854,
		BDI: 108,
		CPV: 132,
		KHM: 116,
		CMR: 120,
		CAN: 124,
		CAF: 140,
		TCD: 148,
		CHL: 152,
		CHN: 156,
		COL: 170,
		COM: 174,
		COG: 178,
		COD: 180,
		CRI: 188,
		CIV: 384,
		HRV: 191,
		CUB: 192,
		CYP: 196,
		CZE: 203,
		DNK: 208,
		DJI: 262,
		DOM: 214,
		ECU: 218,
		EGY: 818,
		SLV: 222,
		GNQ: 226,
		ERI: 232,
		EST: 233,
		ETH: 231,
		FJI: 242,
		FIN: 246,
		FRA: 250,
		GAB: 266,
		GMB: 270,
		GEO: 268,
		DEU: 276,
		GHA: 288,
		GRC: 300,
		GTM: 320,
		GIN: 324,
		GNB: 624,
		GUY: 328,
		HTI: 332,
		HND: 340,
		HUN: 348,
		ISL: 352,
		IND: 356,
		IDN: 360,
		IRN: 364,
		IRQ: 368,
		IRL: 372,
		ISR: 376,
		ITA: 380,
		JAM: 388,
		JPN: 392,
		JOR: 400,
		KAZ: 398,
		KEN: 404,
		PRK: 408,
		KOR: 410,
		KWT: 414,
		KGZ: 417,
		LAO: 418,
		LVA: 428,
		LBN: 422,
		LSO: 426,
		LBR: 430,
		LBY: 434,
		LTU: 440,
		LUX: 442,
		MDG: 450,
		MWI: 454,
		MYS: 458,
		MDV: 462,
		MLI: 466,
		MLT: 470,
		MRT: 478,
		MUS: 480,
		MEX: 484,
		MDA: 498,
		MNG: 496,
		MNE: 499,
		MAR: 504,
		MOZ: 508,
		MMR: 104,
		NAM: 516,
		NPL: 524,
		NLD: 528,
		NZL: 554,
		NIC: 558,
		NER: 562,
		NGA: 566,
		MKD: 807,
		NOR: 578,
		OMN: 512,
		PAK: 586,
		PAN: 591,
		PNG: 598,
		PRY: 600,
		PER: 604,
		PHL: 608,
		POL: 616,
		PRT: 620,
		QAT: 634,
		ROU: 642,
		RUS: 643,
		RWA: 646,
		SAU: 682,
		SEN: 686,
		SRB: 688,
		SLE: 694,
		SGP: 702,
		SVK: 703,
		SVN: 705,
		SOM: 706,
		ZAF: 710,
		SSD: 728,
		ESP: 724,
		LKA: 144,
		SDN: 729,
		SUR: 740,
		SWZ: 748,
		SWE: 752,
		CHE: 756,
		SYR: 760,
		TWN: 158,
		TJK: 762,
		TZA: 834,
		THA: 764,
		TLS: 626,
		TGO: 768,
		TTO: 780,
		TUN: 788,
		TUR: 792,
		TKM: 795,
		UGA: 800,
		UKR: 804,
		ARE: 784,
		GBR: 826,
		USA: 840,
		URY: 858,
		UZB: 860,
		VEN: 862,
		VNM: 704,
		PSE: 275,
		YEM: 887,
		ZMB: 894,
		ZWE: 716
	};
	const NUM_ISO3 = Object.fromEntries(Object.entries(ISO3_NUM).map(([k, v]) => [v, k]));

	// RSF colour categories — brand palette (deep rose → amber → sage)
	const CATEGORIES = [
		{ label: 'Good', range: '75–100', min: 75, color: '#3D5C3A' },
		{ label: 'Satisfactory', range: '55–75', min: 55, color: '#A8C2A3' },
		{ label: 'Problematic', range: '40–55', min: 40, color: '#C47A2B' },
		{ label: 'Difficult', range: '25–40', min: 25, color: '#A8324A' },
		{ label: 'Very serious', range: '0–25', min: 0, color: '#6B1A2E' }
	];
	const NO_DATA_COLOR = '#E5E3DC';

	function getColor(score) {
		if (score == null) return NO_DATA_COLOR;
		for (const c of CATEGORIES) if (score >= c.min) return c.color;
		return CATEGORIES[4].color;
	}
	function getCategory(score) {
		if (score == null) return 'No data';
		for (const c of CATEGORIES) if (score >= c.min) return c.label;
		return CATEGORIES[4].label;
	}

	// Pre-rank all countries by score descending
	const RANKED = Object.entries(RSF).sort((a, b) => b[1].score - a[1].score);
	function getRank(iso3) {
		const i = RANKED.findIndex(([k]) => k === iso3);
		return i >= 0 ? `${i + 1} / ${RANKED.length}` : '—';
	}

	let container;

	// Load topojson from CDN, then draw
	onMount(async () => {
		if (!container) return;
		d3.select(container).selectAll('*').remove();
		await loadScript('https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js');
		const world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
		drawMap(world);
	});

	function loadScript(src) {
		return new Promise((resolve) => {
			if (document.querySelector(`script[src="${src}"]`)) {
				resolve();
				return;
			}
			const s = document.createElement('script');
			s.src = src;
			s.onload = resolve;
			document.head.appendChild(s);
		});
	}

	function drawMap(world) {
		const topojson = window.topojson;

		// Layout
		const TITLE_H = 80;
		const DB_H = 44;
		const DB_GAP = 20; // breathing room between databox and map top
		const LEGEND_GAP = 16; // breathing room between map bottom and legend
		const LEGEND_H = 28;
		const FOOTER_H = 40;
		const MAP_TOP = TITLE_H + DB_H + DB_GAP;
		const MAP_H = height - MAP_TOP - LEGEND_GAP - LEGEND_H - FOOTER_H + 20;
		const ML = spacing.marginDefault.left;

		// SVG root
		const svg = d3
			.select(container)
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', `0 0 ${width} ${height}`)
			.attr('role', 'img')
			.attr('aria-label', `${title} — world choropleth map`)
			.style('background', colors.canvas)
			.style('font-family', type.sans)
			.style('max-width', '100%')
			.style('height', 'auto');

		// Furniture: title, subtitle, source, byline
		addFurniture(svg, { width, height, title, subtitle, source });

		// Databox — fields: country, score (numeric), category, rank
		const box = addDataBox(svg, {
			width,
			height,
			fields: ['country', 'score', 'category', 'rank'],
			total: null,
			y: TITLE_H + 4
		});

		// Projection — Natural Earth, centred on the map area
		const projection = d3
			.geoNaturalEarth1()
			.scale((width / 700) * 100)
			.translate([width / 2, MAP_TOP + MAP_H / 2 + 6]);

		const pathGen = d3.geoPath(projection);
		const mapG = svg.append('g').attr('class', 'vl-map');

		// Ocean fill
		mapG
			.append('path')
			.datum({ type: 'Sphere' })
			.attr('d', pathGen)
			.attr('fill', '#E4EBF0')
			.attr('stroke', colors.gridLine)
			.attr('stroke-width', 0.5);

		// Graticule
		mapG
			.append('path')
			.datum(d3.geoGraticule()())
			.attr('d', pathGen)
			.attr('fill', 'none')
			.attr('stroke', colors.gridLine)
			.attr('stroke-width', 0.2)
			.attr('opacity', 0.6)
			.attr('pointer-events', 'none');

		const features = topojson.feature(world, world.objects.countries).features;
		const borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);

		let active = null;

		// Country fills
		const paths = mapG
			.selectAll('path.vl-country')
			.data(features)
			.join('path')
			.attr('class', 'vl-country')
			.attr('d', pathGen)
			.attr('fill', (d) => {
				const iso3 = NUM_ISO3[+d.id];
				return iso3 && RSF[iso3] ? getColor(RSF[iso3].score) : NO_DATA_COLOR;
			})
			.attr('stroke', colors.canvas)
			.attr('stroke-width', 0.35)
			.style('cursor', (d) => {
				const iso3 = NUM_ISO3[+d.id];
				return iso3 && RSF[iso3] ? 'pointer' : 'default';
			});

		// Border mesh on top (non-interactive)
		mapG
			.append('path')
			.datum(borders)
			.attr('d', pathGen)
			.attr('fill', 'none')
			.attr('stroke', colors.canvas)
			.attr('stroke-width', 0.35)
			.attr('pointer-events', 'none');

		// Show databox for a feature
		function showBox(d) {
			const iso3 = NUM_ISO3[+d.id];
			if (!iso3 || !RSF[iso3]) return;
			const { name, score } = RSF[iso3];
			box.show({
				country: name,
				score: score.toFixed(2),
				category: getCategory(score),
				rank: getRank(iso3),
				value: score,
				name
			});
			box.setColor(getColor(score));
		}

		// --- Interactions ---
		paths
			.on('mouseover', function (event, d) {
				if (active) return;
				const iso3 = NUM_ISO3[+d.id];
				if (!iso3 || !RSF[iso3]) return;
				d3.select(this).attr('stroke', colors.ink).attr('stroke-width', 1).raise();
				showBox(d);
			})
			.on('mouseout', function (event, d) {
				if (active === d) return;
				d3.select(this).attr('stroke', colors.canvas).attr('stroke-width', 0.35);
				if (!active) box.clear();
			})
			.on('click', function (event, d) {
				event.stopPropagation();
				const iso3 = NUM_ISO3[+d.id];
				if (!iso3 || !RSF[iso3]) return;
				if (active === d) {
					// Deselect
					active = null;
					paths.attr('opacity', 1).attr('stroke', colors.canvas).attr('stroke-width', 0.35);
					box.clear();
				} else {
					// Select
					active = d;
					paths.attr('opacity', 0.28).attr('stroke', colors.canvas).attr('stroke-width', 0.35);
					d3.select(this)
						.attr('opacity', 1)
						.attr('stroke', colors.ink)
						.attr('stroke-width', 1.5)
						.raise();
					showBox(d);
				}
			});

		// Click background → clear
		svg.on('click', () => {
			if (active) {
				active = null;
				paths.attr('opacity', 1).attr('stroke', colors.canvas).attr('stroke-width', 0.35);
				box.clear();
			}
		});

		// --- Legend ---
		const legendY = TITLE_H - 20;
		const legendG = svg.append('g').attr('transform', `translate(${ML}, ${legendY})`);
		const SW = 16,
			SH = 9;
		let lx = 0;

		// Render Good → Very serious left to right
		[...CATEGORIES].reverse().forEach(({ label, range, color }) => {
			const lg = legendG.append('g').attr('transform', `translate(${lx}, 0)`);
			lg.append('rect').attr('width', SW).attr('height', SH).attr('rx', 2).attr('fill', color);
			const fullLabel = `${label} (${range})`;
			lg.append('text')
				.attr('x', SW + 4)
				.attr('y', SH - 1)
				.style('font-size', '10px')
				.style('fill', colors.warmGray)
				.text(fullLabel);
			lx += SW + 4 + fullLabel.length * 5.4 + 10;
		});

		// No data swatch
		const ndG = legendG.append('g').attr('transform', `translate(${lx}, 0)`);
		ndG
			.append('rect')
			.attr('width', SW)
			.attr('height', SH)
			.attr('rx', 2)
			.attr('fill', NO_DATA_COLOR)
			.attr('stroke', colors.warmGray)
			.attr('stroke-width', 0.5);
		ndG
			.append('text')
			.attr('x', SW + 4)
			.attr('y', SH - 1)
			.style('font-size', '10px')
			.style('fill', colors.warmGray)
			.text('No data');
	}
</script>

<div bind:this={container} style="position: relative; width: 100%; margin: 2rem 0;" />
