<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { colors, type, spacing } from '$lib/chartUtils/theme.js';
	import { createSvg, addFurniture, addA11yTable, createDataBox } from '$lib/chartUtils/utils.js';

	// --- Props ---
	export let subtitle =
		'Domestic parcels now dwarf international volumes — especially in wealthy nations';
	export let title =
		'Day 20: Global Change - Items 10.4 (domestic) vs 10.5 (international dispatch), by income group, 1980–2024';
	export let source = 'UPU Postal Statistics';
	export let width = 960;
	export let height = 560;

	// --- Raw data (inline) ---
	const rawDomestic = {
		'High income': [
			[1980, 1695459426],
			[1981, 1694739123],
			[1982, 1667224219],
			[1983, 1648995307],
			[1984, 1722661744],
			[1985, 1753786867],
			[1986, 1824889067],
			[1987, 2051269749],
			[1988, 2293891447],
			[1989, 2649987500],
			[1990, 2735804082],
			[1991, 2905725439],
			[1992, 3318031172],
			[1993, 3388207484],
			[1994, 3582243000],
			[1995, 3850101359],
			[1996, 3957068073],
			[1997, 4016906375],
			[1998, 4147259538],
			[1999, 4156622564],
			[2000, 4386953139],
			[2001, 4454172783],
			[2002, 4554979834],
			[2003, 4710054350],
			[2004, 5050956736],
			[2005, 5000728514],
			[2006, 5185480045],
			[2007, 6654480947],
			[2008, 6956509687],
			[2009, 7485848228],
			[2010, 7761377042],
			[2011, 8455522628],
			[2012, 8726896382],
			[2013, 9435138644],
			[2014, 9935833122],
			[2015, 10781468317],
			[2016, 12292804337],
			[2017, 13298027010],
			[2018, 14308055685],
			[2019, 15568352048],
			[2020, 17387477834],
			[2021, 17953553541],
			[2022, 16923515924],
			[2023, 16556923342],
			[2024, 17612942056]
		],
		'Middle income': [
			[1980, 263339442],
			[1981, 239777782],
			[1982, 201386962],
			[1983, 181253881],
			[1984, 169039281],
			[1985, 172874518],
			[1986, 175928316],
			[1987, 190281001],
			[1988, 198181820],
			[1989, 175357813],
			[1990, 165432427],
			[1991, 198373900],
			[1992, 199093668],
			[1993, 253313991],
			[1994, 265280692],
			[1995, 252362895],
			[1996, 245402067],
			[1997, 197804117],
			[1998, 193188690],
			[1999, 188295694],
			[2000, 180885239],
			[2001, 174371026],
			[2002, 189709682],
			[2003, 195796799],
			[2004, 190546750],
			[2005, 180584755],
			[2006, 165260732],
			[2007, 166844431],
			[2008, 176990147],
			[2009, 177072801],
			[2010, 181004361],
			[2011, 236034545],
			[2012, 820200477],
			[2013, 984687467],
			[2014, 1044973243],
			[2015, 1378664440],
			[2016, 2230236426],
			[2017, 2842004907],
			[2018, 3875840877],
			[2019, 5370478844],
			[2020, 7303000702],
			[2021, 9545878816],
			[2022, 9756998211],
			[2023, 9894897717],
			[2024, 10471656926]
		],
		'Low income': [
			[1980, 99435084],
			[1981, 122945741],
			[1982, 140218752],
			[1983, 156763187],
			[1984, 149723659],
			[1985, 161357974],
			[1986, 163314767],
			[1987, 161973518],
			[1988, 164282578],
			[1989, 167107586],
			[1990, 168911267],
			[1991, 197301058],
			[1992, 201384123],
			[1993, 205233030],
			[1994, 148918336],
			[1995, 167326182],
			[1996, 170633044],
			[1997, 224302230],
			[1998, 296059171],
			[1999, 304828150],
			[2000, 240670879],
			[2001, 199499854],
			[2002, 166747646],
			[2003, 138361007],
			[2004, 114097149],
			[2005, 95641297],
			[2006, 88410528],
			[2007, 89351609],
			[2008, 95807896],
			[2009, 97468043],
			[2010, 99987927],
			[2011, 102645391],
			[2012, 109218257],
			[2013, 111782487],
			[2014, 94120713],
			[2015, 120146100],
			[2016, 139220717],
			[2017, 143482636],
			[2018, 227193732],
			[2019, 176532378],
			[2020, 150024950],
			[2021, 194192690],
			[2022, 228769471],
			[2023, 301170599],
			[2024, 289688112]
		]
	};

	const rawIntl = {
		'High income': [
			[1980, 42958960],
			[1981, 44708487],
			[1982, 45781618],
			[1983, 44998891],
			[1984, 47297371],
			[1985, 47555817],
			[1986, 46026223],
			[1987, 47511133],
			[1988, 45736830],
			[1989, 43025311],
			[1990, 41869746],
			[1991, 40737487],
			[1992, 38629007],
			[1993, 37269018],
			[1994, 37197705],
			[1995, 38237090],
			[1996, 37086776],
			[1997, 37861267],
			[1998, 36490184],
			[1999, 35401554],
			[2000, 37481880],
			[2001, 40234995],
			[2002, 43333415],
			[2003, 36803511],
			[2004, 38063095],
			[2005, 36862779],
			[2006, 37125205],
			[2007, 42188650],
			[2008, 48051064],
			[2009, 51099380],
			[2010, 62044456],
			[2011, 77404319],
			[2012, 93770125],
			[2013, 106220023],
			[2014, 120106233],
			[2015, 144430516],
			[2016, 168876561],
			[2017, 212246000],
			[2018, 217492254],
			[2019, 229969172],
			[2020, 197290904],
			[2021, 160531033],
			[2022, 158620774],
			[2023, 173918441],
			[2024, 176464762]
		],
		'Middle income': [
			[1980, 3280259],
			[1981, 3198711],
			[1982, 2959360],
			[1983, 2878179],
			[1984, 3042009],
			[1985, 2911124],
			[1986, 2785872],
			[1987, 2805460],
			[1988, 2816888],
			[1989, 2835405],
			[1990, 2948137],
			[1991, 3273475],
			[1992, 3064885],
			[1993, 2711862],
			[1994, 3046970],
			[1995, 2614411],
			[1996, 2458124],
			[1997, 2341844],
			[1998, 2322567],
			[1999, 2425763],
			[2000, 2666611],
			[2001, 2810724],
			[2002, 3326990],
			[2003, 3613938],
			[2004, 3637663],
			[2005, 3967467],
			[2006, 4609534],
			[2007, 4949975],
			[2008, 4636915],
			[2009, 4867103],
			[2010, 4910107],
			[2011, 4995698],
			[2012, 5275140],
			[2013, 5304320],
			[2014, 5588458],
			[2015, 7020009],
			[2016, 7443187],
			[2017, 7501709],
			[2018, 7375605],
			[2019, 8657766],
			[2020, 11228875],
			[2021, 8968206],
			[2022, 9821300],
			[2023, 9830242],
			[2024, 10106940]
		],
		'Low income': [
			[1980, 1849908],
			[1981, 1957727],
			[1982, 1752245],
			[1983, 1530141],
			[1984, 1475310],
			[1985, 1323456],
			[1986, 1272337],
			[1987, 1189781],
			[1988, 1120181],
			[1989, 1132812],
			[1990, 1092524],
			[1991, 1375433],
			[1992, 1291573],
			[1993, 1290417],
			[1994, 1055171],
			[1995, 894897],
			[1996, 799352],
			[1997, 729572],
			[1998, 678531],
			[1999, 631165],
			[2000, 605816],
			[2001, 610755],
			[2002, 643755],
			[2003, 670357],
			[2004, 740845],
			[2005, 738592],
			[2006, 729854],
			[2007, 724611],
			[2008, 816501],
			[2009, 894283],
			[2010, 997179],
			[2011, 1045501],
			[2012, 1091384],
			[2013, 1115115],
			[2014, 1091484],
			[2015, 1178924],
			[2016, 1244738],
			[2017, 1297098],
			[2018, 1295543],
			[2019, 1210490],
			[2020, 1511602],
			[2021, 1533123],
			[2022, 1521426],
			[2023, 1690169],
			[2024, 1814799]
		]
	};

	const groups = ['High income', 'Middle income', 'Low income'];

	// Clearly distinct, high-contrast colours per group
	const groupColors = {
		'High income': '#2D5016', // deep forest green
		'Middle income': '#8B4513', // saddle brown
		'Low income': '#1A3A5C' // deep navy blue
	};

	const groupLabels = {
		'High income': 'High income countries',
		'Middle income': 'Middle income countries',
		'Low income': 'Low income countries'
	};

	// Hatch pattern IDs — bold, distinct: diagonals / dots / crosshatch
	// Defined in SVG <defs> inside draw()

	let container;
	onMount(() => {
		draw();
	});

	function fmt(v) {
		if (v >= 1e9) return (v / 1e9).toFixed(1) + 'B';
		if (v >= 1e6) return (v / 1e6).toFixed(0) + 'M';
		return v.toLocaleString();
	}

	function draw() {
		if (!container) return;
		d3.select(container).selectAll('*').remove();

		// ── Layout ───────────────────────────────────────────────────────────────
		const TITLE_H = 200;
		const FOOTER_H = 36;
		const panelGap = 56; // wider to accommodate y-axis on each panel
		const nPanels = 3;
		const totalW = width;
		const totalH = height;
		const L = 70;
		const R = 40;
		const T = TITLE_H;
		const B = spacing.marginDefault.bottom + FOOTER_H;
		const panelW = (totalW - L - R - panelGap * (nPanels - 1)) / nPanels;
		const chartH = totalH - T - B;

		// ── SVG root ──────────────────────────────────────────────────────────────
		const svg = createSvg(container, {
			width: totalW,
			height: totalH,
			ariaLabel: `${title} — small multiples line chart`
		});

		// ── <defs>: bold distinct patterns per group ──────────────────────────────
		const defs = svg.append('defs');

		// High income: thick diagonal lines (45°, bold, well-spaced)
		const pHigh = defs
			.append('pattern')
			.attr('id', 'hatch-High-income')
			.attr('patternUnits', 'userSpaceOnUse')
			.attr('width', 10)
			.attr('height', 10)
			.attr('patternTransform', 'rotate(45)');
		pHigh
			.append('line')
			.attr('x1', 0)
			.attr('y1', 0)
			.attr('x2', 0)
			.attr('y2', 10)
			.attr('stroke', groupColors['High income'])
			.attr('stroke-width', 2.5)
			.attr('stroke-opacity', 0.55);

		// Middle income: dots (circles, well-spaced grid)
		const pMid = defs
			.append('pattern')
			.attr('id', 'hatch-Middle-income')
			.attr('patternUnits', 'userSpaceOnUse')
			.attr('width', 9)
			.attr('height', 9);
		pMid
			.append('circle')
			.attr('cx', 4.5)
			.attr('cy', 4.5)
			.attr('r', 2)
			.attr('fill', groupColors['Middle income'])
			.attr('fill-opacity', 0.55);

		// Low income: crosshatch (two sets of lines at 45° and 135°)
		const pLow = defs
			.append('pattern')
			.attr('id', 'hatch-Low-income')
			.attr('patternUnits', 'userSpaceOnUse')
			.attr('width', 10)
			.attr('height', 10);
		// forward diagonal
		pLow
			.append('line')
			.attr('x1', 0)
			.attr('y1', 10)
			.attr('x2', 10)
			.attr('y2', 0)
			.attr('stroke', groupColors['Low income'])
			.attr('stroke-width', 1.8)
			.attr('stroke-opacity', 0.5);
		// back diagonal
		pLow
			.append('line')
			.attr('x1', 0)
			.attr('y1', 0)
			.attr('x2', 10)
			.attr('y2', 10)
			.attr('stroke', groupColors['Low income'])
			.attr('stroke-width', 1.8)
			.attr('stroke-opacity', 0.5);

		// ── Furniture ─────────────────────────────────────────────────────────────
		addFurniture(svg, { width: totalW, height: totalH, title, subtitle, source });

		// ── DataBox ───────────────────────────────────────────────────────────────
		const box = createDataBox(svg, {
			width: totalW,
			fields: [
				{ key: 'year', label: 'YEAR' },
				{ key: 'group', label: 'INCOME GROUP' },
				{ key: 'dom', label: 'DOMESTIC (10.4)' },
				{ key: 'intl', label: 'INTERNATIONAL (10.5)' },
				{ key: 'ratio', label: 'DOM ÷ INTL' }
			],
			y: 100,
			prompt: 'Tap a data point to explore'
		});

		// ── Legend — beneath subtitle at ~y=58 ───────────────────────────────────
		const lgG = svg.append('g').attr('transform', `translate(${L}, 58)`);
		lgG
			.append('line')
			.attr('x1', 0)
			.attr('x2', 18)
			.attr('y1', 8)
			.attr('y2', 8)
			.attr('stroke', colors.ink)
			.attr('stroke-width', 2);
		lgG
			.append('text')
			.attr('x', 24)
			.attr('y', 12)
			.style('font-family', type.sans)
			.style('font-size', '11px')
			.style('fill', colors.warmGray)
			.text('Domestic (10.4)');
		lgG
			.append('line')
			.attr('x1', 125)
			.attr('x2', 143)
			.attr('y1', 8)
			.attr('y2', 8)
			.attr('stroke', colors.roseDark)
			.attr('stroke-width', 1.5)
			.attr('stroke-dasharray', '4,3');
		lgG
			.append('text')
			.attr('x', 149)
			.attr('y', 12)
			.style('font-family', type.sans)
			.style('font-size', '11px')
			.style('fill', colors.warmGray)
			.text('International (10.5)');

		// ── Shared x scale ────────────────────────────────────────────────────────
		const xScale = d3.scaleLinear().domain([1980, 2024]).range([0, panelW]);

		// ── Per-group y scales ────────────────────────────────────────────────────
		const yScales = {};
		groups.forEach((g) => {
			const allVals = [...rawDomestic[g].map((d) => d[1]), ...rawIntl[g].map((d) => d[1])];
			yScales[g] = d3
				.scaleLinear()
				.domain([0, d3.max(allVals) * 1.1])
				.range([chartH, 0])
				.nice();
		});

		// ── Line generator (shared) ───────────────────────────────────────────────
		const lineGen = d3
			.line()
			.x((d) => xScale(d[0]))
			.y((d) => yScales[groups[0]](0)) // will be re-bound per panel
			.curve(d3.curveMonotoneX);

		// ── Draw each panel ───────────────────────────────────────────────────────
		groups.forEach((grp, i) => {
			const panelX = L + i * (panelW + panelGap);
			const panelG = svg.append('g').attr('transform', `translate(${panelX}, ${T})`);
			const y = yScales[grp];
			const col = groupColors[grp];
			const hatchId = `hatch-${grp.replace(/\s+/g, '-')}`;

			const domData = rawDomestic[grp];
			const intlData = rawIntl[grp];
			const domMap = new Map(domData);
			const intlMap = new Map(intlData);

			// Per-panel line generators using this panel's y scale
			const domLineG = d3
				.line()
				.x((d) => xScale(d[0]))
				.y((d) => y(d[1]))
				.curve(d3.curveMonotoneX);
			const areaG = d3
				.area()
				.x((d) => xScale(d[0]))
				.y0(chartH)
				.y1((d) => y(d[1]))
				.curve(d3.curveMonotoneX);

			// Panel title
			panelG
				.append('text')
				.attr('x', 0)
				.attr('y', -14)
				.style('font-family', type.sans)
				.style('font-size', '12px')
				.style('font-weight', '500')
				.style('fill', col)
				.text(groupLabels[grp]);

			// Clip path
			const clipId = `clip-${i}`;
			panelG
				.append('clipPath')
				.attr('id', clipId)
				.append('rect')
				.attr('width', panelW)
				.attr('height', chartH);
			const clip = panelG.append('g').attr('clip-path', `url(#${clipId})`);

			// Grid lines
			const yTicks = y.ticks(4);
			panelG
				.selectAll('.vl-grid')
				.data(yTicks)
				.join('line')
				.attr('class', 'vl-grid')
				.attr('x1', 0)
				.attr('x2', panelW)
				.attr('y1', (d) => y(d))
				.attr('y2', (d) => y(d))
				.attr('stroke', colors.gridLine)
				.attr('stroke-width', spacing.gridWidth);

			// Y axis — every panel
			panelG
				.append('g')
				.call(
					d3
						.axisLeft(y)
						.tickValues(yTicks)
						.tickSize(0)
						.tickPadding(spacing.labelPad)
						.tickFormat((v) => fmt(v))
				)
				.call((ax) => ax.select('.domain').remove())
				.selectAll('text')
				.style('font-family', type.sans)
				.style('font-size', `${type.axisLabel}px`)
				.style('fill', colors.warmGray);

			// X axis
			panelG
				.append('g')
				.attr('transform', `translate(0, ${chartH})`)
				.call(
					d3
						.axisBottom(xScale)
						.tickValues([1980, 1990, 2000, 2010, 2024])
						.tickSize(0)
						.tickPadding(spacing.labelPad)
						.tickFormat(d3.format('d'))
				)
				.call((ax) => ax.select('.domain').remove())
				.selectAll('text')
				.style('font-family', type.sans)
				.style('font-size', `${type.axisLabel}px`)
				.style('fill', colors.warmGray);

			// Area fill (solid base — texture sits on top)
			clip
				.append('path')
				.datum(domData)
				.attr('d', areaG)
				.attr('fill', col)
				.attr('fill-opacity', 0.12);

			// Bold texture overlay (diagonals / dots / crosshatch per group)
			clip
				.append('path')
				.datum(domData)
				.attr('d', areaG)
				.attr('fill', `url(#${hatchId})`)
				.attr('stroke', 'none');

			// International line (dashed, rose dark)
			clip
				.append('path')
				.datum(intlData)
				.attr('d', domLineG)
				.attr('fill', 'none')
				.attr('stroke', colors.roseDark)
				.attr('stroke-width', 1.5)
				.attr('stroke-dasharray', '4,3');

			// Domestic line (solid, group colour, slightly thicker)
			clip
				.append('path')
				.datum(domData)
				.attr('d', domLineG)
				.attr('fill', 'none')
				.attr('stroke', col)
				.attr('stroke-width', 2);

			// Interactive dots
			const domDots = panelG
				.selectAll(`.dd-${i}`)
				.data(domData)
				.join('circle')
				.attr('class', `dd-${i}`)
				.attr('cx', (d) => xScale(d[0]))
				.attr('cy', (d) => y(d[1]))
				.attr('r', 4)
				.attr('fill', col)
				.attr('fill-opacity', 0)
				.attr('stroke', col)
				.attr('stroke-width', 1.5)
				.attr('stroke-opacity', 0);

			const intlDots = panelG
				.selectAll(`.di-${i}`)
				.data(intlData)
				.join('circle')
				.attr('class', `di-${i}`)
				.attr('cx', (d) => xScale(d[0]))
				.attr('cy', (d) => y(d[1]))
				.attr('r', 3.5)
				.attr('fill', colors.roseDark)
				.attr('fill-opacity', 0)
				.attr('stroke', colors.roseDark)
				.attr('stroke-width', 1.5)
				.attr('stroke-opacity', 0);

			// Hover rects (one per year)
			const slotW = panelW / domData.length;
			panelG
				.selectAll(`.hr-${i}`)
				.data(domData)
				.join('rect')
				.attr('class', `hr-${i}`)
				.attr('x', (d) => xScale(d[0]) - slotW / 2)
				.attr('y', 0)
				.attr('width', slotW)
				.attr('height', chartH)
				.attr('fill', 'transparent')
				.style('cursor', 'pointer')
				.on('mouseover click touchstart', function (event, d) {
					const yr = d[0];
					const domVal = domMap.get(yr) ?? 0;
					const intlVal = intlMap.get(yr) ?? 0;
					const ratio = intlVal > 0 ? (domVal / intlVal).toFixed(0) + '×' : 'N/A';
					domDots
						.attr('fill-opacity', (dd) => (dd[0] === yr ? 1 : 0))
						.attr('stroke-opacity', (dd) => (dd[0] === yr ? 1 : 0));
					intlDots
						.attr('fill-opacity', (dd) => (dd[0] === yr ? 1 : 0))
						.attr('stroke-opacity', (dd) => (dd[0] === yr ? 1 : 0));
					box.show(
						{ year: yr, group: groupLabels[grp], dom: fmt(domVal), intl: fmt(intlVal), ratio },
						col
					);
				});
		});

		// Clear button
		box.btnG.on('click', () => {
			box.clear();
			groups.forEach((_, i) => {
				svg.selectAll(`.dd-${i},.di-${i}`).attr('fill-opacity', 0).attr('stroke-opacity', 0);
			});
		});

		// Accessibility table
		const a11yRows = [];
		groups.forEach((grp) => {
			rawDomestic[grp].forEach(([yr, dv]) => {
				const iv = (rawIntl[grp].find((d) => d[0] === yr) ?? [yr, 0])[1];
				a11yRows.push({
					year: yr,
					group: groupLabels[grp],
					domestic: fmt(dv),
					international: fmt(iv)
				});
			});
		});
		addA11yTable(svg.node(), {
			caption: `${title} — data table`,
			columns: [
				{ key: 'year', label: 'Year' },
				{ key: 'group', label: 'Income group' },
				{ key: 'domestic', label: 'Domestic parcels (10.4)' },
				{ key: 'international', label: 'International dispatch (10.5)' }
			],
			rows: a11yRows
		});
	}
</script>

<div bind:this={container} style="position: relative; width: 100%; margin: 2rem 0;" />
