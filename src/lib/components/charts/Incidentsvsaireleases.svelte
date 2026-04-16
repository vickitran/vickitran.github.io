<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { colors, type, spacing } from '$lib/chartUtils/theme.js';
	import { createSvg, addFurniture, addA11yTable, createDataBox } from '$lib/chartUtils/utils.js';

	// --- Props ---
	export let title =
		'Day 16: Causation - Monthly AI incidents (AIID) vs. significant AI model releases (AI Timeline)';
	export let subtitle = ' As AI capability accelerates, so do reported incidents';
	export let source =
		'AI Incident Database (aiincidentdatabase.org); AI Timeline (nhlocal.github.io/AiTimeline)';
	export let width = 960;
	export let height = 560;

	let container;

	// --- Incidents per month: AIID CSV, 2022-01 to 2026-03 ---
	const incidents = [
		// 2022
		[2022, 1, 7],
		[2022, 2, 10],
		[2022, 3, 10],
		[2022, 4, 10],
		[2022, 5, 6],
		[2022, 6, 8],
		[2022, 7, 5],
		[2022, 8, 8],
		[2022, 9, 7],
		[2022, 10, 6],
		[2022, 11, 18],
		[2022, 12, 10],
		// 2023
		[2023, 1, 13],
		[2023, 2, 30],
		[2023, 3, 16],
		[2023, 4, 8],
		[2023, 5, 17],
		[2023, 6, 15],
		[2023, 7, 7],
		[2023, 8, 10],
		[2023, 9, 5],
		[2023, 10, 18],
		[2023, 11, 9],
		[2023, 12, 20],
		// 2024
		[2024, 1, 15],
		[2024, 2, 26],
		[2024, 3, 19],
		[2024, 4, 33],
		[2024, 5, 23],
		[2024, 6, 22],
		[2024, 7, 25],
		[2024, 8, 20],
		[2024, 9, 27],
		[2024, 10, 32],
		[2024, 11, 17],
		[2024, 12, 25],
		// 2025
		[2025, 1, 30],
		[2025, 2, 44],
		[2025, 3, 42],
		[2025, 4, 46],
		[2025, 5, 29],
		[2025, 6, 37],
		[2025, 7, 32],
		[2025, 8, 30],
		[2025, 9, 13],
		[2025, 10, 32],
		[2025, 11, 22],
		[2025, 12, 37],
		// 2026
		[2026, 1, 29],
		[2026, 2, 23],
		[2026, 3, 11]
	];

	// --- Significant AI model/capability releases per month (AI Timeline) ---
	// Counted from nhlocal.github.io/AiTimeline, "Significant" filter, 2022-2026
	const aiEvents = [
		// 2022
		[2022, 1, 2],
		[2022, 2, 3],
		[2022, 3, 2],
		[2022, 4, 2],
		[2022, 5, 3],
		[2022, 6, 2],
		[2022, 7, 2],
		[2022, 8, 2],
		[2022, 9, 3],
		[2022, 10, 3],
		[2022, 11, 4],
		[2022, 12, 3],
		// 2023
		[2023, 1, 4],
		[2023, 2, 4],
		[2023, 3, 5],
		[2023, 4, 3],
		[2023, 5, 4],
		[2023, 6, 3],
		[2023, 7, 3],
		[2023, 8, 2],
		[2023, 9, 3],
		[2023, 10, 4],
		[2023, 11, 3],
		[2023, 12, 3],
		// 2024
		[2024, 1, 4],
		[2024, 2, 5],
		[2024, 3, 4],
		[2024, 4, 3],
		[2024, 5, 5],
		[2024, 6, 4],
		[2024, 7, 4],
		[2024, 8, 3],
		[2024, 9, 4],
		[2024, 10, 4],
		[2024, 11, 3],
		[2024, 12, 4],
		// 2025
		[2025, 1, 4],
		[2025, 2, 7],
		[2025, 3, 8],
		[2025, 4, 8],
		[2025, 5, 12],
		[2025, 6, 3],
		[2025, 7, 7],
		[2025, 8, 7],
		[2025, 9, 9],
		[2025, 10, 5],
		[2025, 11, 11],
		[2025, 12, 10],
		// 2026
		[2026, 1, 5],
		[2026, 2, 8],
		[2026, 3, 4]
	];

	// Build unified dataset
	const monthIndex = (y, m) => (y - 2022) * 12 + (m - 1);

	const data = incidents.map(([year, month, count]) => {
		const ai = aiEvents.find(([y, m]) => y === year && m === month);
		return {
			year,
			month,
			date: new Date(year, month - 1, 1),
			key: `${year}-${String(month).padStart(2, '0')}`,
			label: `${
				['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][
					month - 1
				]
			} ${year}`,
			incidents: count,
			aiEvents: ai ? ai[2] : 0
		};
	});

	onMount(() => {
		draw();
	});

	function draw() {
		if (!container || !data.length) return;
		d3.select(container).selectAll('*').remove();

		// --- Layout ---
		// TITLE_H: title + subtitle + legend row + databox = 136
		const TITLE_H = 136;
		const FOOTER_H = 30;
		const L = spacing.marginDefault.left;
		const R = spacing.marginDefault.right + 40; // extra right for second y-axis label
		const T = TITLE_H;
		const B = spacing.marginDefault.bottom + FOOTER_H;
		const chartW = width - L - R;
		const chartH = height - T - B;

		// --- Scales ---
		const x = d3
			.scaleBand()
			.domain(data.map((d) => d.key))
			.range([0, chartW])
			.padding(0.22);

		const yLeft = d3
			.scaleLinear()
			.domain([0, d3.max(data, (d) => d.incidents) * 1.15])
			.range([chartH, 0])
			.nice();

		const yRight = d3
			.scaleLinear()
			.domain([0, d3.max(data, (d) => d.aiEvents) * 1.2])
			.range([chartH, 0])
			.nice();

		const yLeftTicks = yLeft.ticks(6);
		const yRightTicks = yRight.ticks(6);

		// --- SVG root ---
		const svg = createSvg(container, {
			width,
			height,
			ariaLabel: `${title} — combined bar and line chart`
		});

		// --- Furniture ---
		addFurniture(svg, { width, height, title, subtitle, source });

		// --- Legend (y=58) ---
		const legendG = svg
			.append('g')
			.attr('transform', `translate(${L}, 58)`)
			.attr('role', 'list')
			.attr('aria-label', 'Chart legend');

		const legendItems = [
			{ color: colors.sageDark, label: 'AI incidents per month (left axis)', shape: 'rect' },
			{
				color: colors.roseDark,
				label: 'Significant AI releases per month (right axis)',
				shape: 'line'
			}
		];

		let lx = 0;
		legendItems.forEach((item) => {
			const itemG = legendG
				.append('g')
				.attr('role', 'listitem')
				.attr('transform', `translate(${lx}, 0)`);

			if (item.shape === 'line') {
				itemG
					.append('line')
					.attr('x1', 0)
					.attr('y1', 5)
					.attr('x2', 16)
					.attr('y2', 5)
					.attr('stroke', item.color)
					.attr('stroke-width', spacing.strokeWidth)
					.attr('aria-hidden', 'true');
				itemG
					.append('circle')
					.attr('cx', 8)
					.attr('cy', 5)
					.attr('r', spacing.dotRadius - 1)
					.attr('fill', item.color)
					.attr('aria-hidden', 'true');
			} else {
				itemG
					.append('rect')
					.attr('width', 10)
					.attr('height', 10)
					.attr('rx', 2)
					.attr('y', 0)
					.attr('fill', item.color)
					.attr('aria-hidden', 'true');
			}

			itemG
				.append('text')
				.attr('x', 20)
				.attr('y', 9)
				.style('font-family', type.sans)
				.style('font-size', '11px')
				.style('fill', colors.warmGray)
				.text(item.label);

			lx += itemG.node().getBBox().width + 24;
		});

		// --- DataBox (y=86) ---
		const box = createDataBox(svg, {
			width,
			fields: [
				{ key: 'label', label: 'MONTH' },
				{ key: 'incidents', label: 'INCIDENTS' },
				{ key: 'aiEvents', label: 'AI RELEASES' }
			],
			y: 86,
			prompt: 'Tap a bar to explore'
		});

		// --- Chart group ---
		const g = svg.append('g').attr('transform', `translate(${L}, ${T})`);

		// Grid lines (left scale)
		g.selectAll('.vl-grid')
			.data(yLeftTicks)
			.join('line')
			.attr('class', 'vl-grid')
			.attr('x1', 0)
			.attr('x2', chartW)
			.attr('y1', (d) => yLeft(d))
			.attr('y2', (d) => yLeft(d))
			.attr('stroke', colors.gridLine)
			.attr('stroke-width', spacing.gridWidth);

		// --- Bars: incidents ---
		const bars = g
			.selectAll('.vl-bar')
			.data(data)
			.join('rect')
			.attr('class', 'vl-bar')
			.attr('x', (d) => x(d.key))
			.attr('y', (d) => yLeft(d.incidents))
			.attr('width', x.bandwidth())
			.attr('height', (d) => chartH - yLeft(d.incidents))
			.attr('rx', spacing.cornerRadius)
			.attr('fill', colors.sageDark)
			.attr('opacity', 0.75)
			.style('cursor', 'pointer');

		// --- Line: AI events (right axis) ---
		const lineGen = d3
			.line()
			.x((d) => x(d.key) + x.bandwidth() / 2)
			.y((d) => yRight(d.aiEvents))
			.curve(d3.curveMonotoneX);

		g.append('path')
			.datum(data)
			.attr('fill', 'none')
			.attr('stroke', colors.roseDark)
			.attr('stroke-width', spacing.strokeWidth)
			.attr('d', lineGen)
			.attr('pointer-events', 'none');

		// Dots on the line
		g.selectAll('.vl-dot')
			.data(data)
			.join('circle')
			.attr('class', 'vl-dot')
			.attr('cx', (d) => x(d.key) + x.bandwidth() / 2)
			.attr('cy', (d) => yRight(d.aiEvents))
			.attr('r', spacing.dotRadius - 1)
			.attr('fill', colors.roseDark)
			.attr('pointer-events', 'none');

		// --- Left Y axis (incidents) ---
		g.append('g')
			.call(
				d3
					.axisLeft(yLeft)
					.tickValues(yLeftTicks)
					.tickSize(0)
					.tickPadding(spacing.labelPad)
					.tickFormat((v) => v)
			)
			.call((ax) => ax.select('.domain').remove())
			.selectAll('text')
			.style('font-family', type.sans)
			.style('font-size', `${type.axisLabel}px`)
			.style('fill', colors.warmGray);

		// Left axis label
		g.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('x', -chartH / 2)
			.attr('y', -spacing.marginDefault.left + 14)
			.attr('text-anchor', 'middle')
			.style('font-family', type.sans)
			.style('font-size', '11px')
			.style('fill', colors.sageDark)
			.text('Incidents per month');

		// --- Right Y axis (AI events) ---
		g.append('g')
			.attr('transform', `translate(${chartW}, 0)`)
			.call(
				d3
					.axisRight(yRight)
					.tickValues(yRightTicks)
					.tickSize(0)
					.tickPadding(spacing.labelPad)
					.tickFormat((v) => v)
			)
			.call((ax) => ax.select('.domain').remove())
			.selectAll('text')
			.style('font-family', type.sans)
			.style('font-size', `${type.axisLabel}px`)
			.style('fill', colors.warmGray);

		// Right axis label
		g.append('text')
			.attr('transform', 'rotate(90)')
			.attr('x', chartH / 2)
			.attr('y', -(chartW + R - 12))
			.attr('text-anchor', 'middle')
			.style('font-family', type.sans)
			.style('font-size', '11px')
			.style('fill', colors.roseDark)
			.text('AI releases per month');

		// --- X axis (quarterly labels) ---
		const xTickKeys = data
			.filter((d) => d.month === 1 || d.month === 4 || d.month === 7 || d.month === 10)
			.map((d) => d.key);

		g.append('g')
			.attr('transform', `translate(0, ${chartH})`)
			.call(
				d3
					.axisBottom(x)
					.tickValues(xTickKeys)
					.tickSize(0)
					.tickPadding(spacing.labelPad)
					.tickFormat((key) => {
						const d = data.find((r) => r.key === key);
						return d
							? `${['Jan', 'Apr', 'Jul', 'Oct'][Math.floor((d.month - 1) / 3)]} '${String(
									d.year
							  ).slice(2)}`
							: '';
					})
			)
			.call((ax) => ax.select('.domain').remove())
			.selectAll('text')
			.style('font-family', type.sans)
			.style('font-size', `${type.axisLabel}px`)
			.style('fill', colors.warmGray);

		// --- Wire DataBox to bars ---
		let activeBar = null;

		function clearSelection() {
			activeBar = null;
			bars.attr('opacity', 0.75);
			box.clear();
		}

		bars
			.attr('role', 'button')
			.attr('tabindex', 0)
			.attr('aria-label', (d) => `${d.label}: ${d.incidents} incidents, ${d.aiEvents} AI releases`)
			.on('click.databox touchstart.databox keydown.databox', function (event, d) {
				if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
				if (event.type === 'touchstart') event.preventDefault();
				event.stopPropagation();

				const isSame = activeBar === this;
				clearSelection();
				if (isSame) return;

				activeBar = this;
				bars.attr('opacity', 0.25);
				d3.select(this).attr('opacity', 1);

				box.show(
					{
						label: d.label,
						incidents: String(d.incidents),
						aiEvents: String(d.aiEvents)
					},
					colors.sageDark
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
				{ key: 'label', label: 'Month' },
				{ key: 'incidents', label: 'AI incidents' },
				{ key: 'aiEvents', label: 'Significant AI releases' }
			],
			rows: data.map((d) => ({
				label: d.label,
				incidents: d.incidents,
				aiEvents: d.aiEvents
			}))
		});
	}
</script>

<div bind:this={container} style="position: relative; width: 100%; margin: 2rem 0;" />
