<script>
	import { onMount, onDestroy } from 'svelte';
	import * as d3 from 'd3';
	import { colors, type, spacing } from '$lib/chartUtils/theme.js';
	import { createSvg, addFurniture, addA11yTable } from '$lib/chartUtils/utils.js';

	// ---------------------------------------------------------------------------
	// Props
	// ---------------------------------------------------------------------------

	/**
	 * data — array of note objects, Erie-compatible format:
	 *   [{ start: 0, length: 0.3, note: "C5" }, ...]
	 *
	 * start  — onset time in seconds
	 * length — duration in seconds
	 * note   — scientific pitch notation, e.g. "C4", "D#4", "Bb3"
	 *
	 * waveform — oscillator type: 'triangle' | 'sine' | 'square' | 'sawtooth'
	 */
	export let data = [];
	export let title = 'Data sonification';
	export let subtitle = '';
	export let source = '';
	export let width = 960;
	export let height = 400;
	export let waveform = 'triangle';

	let container;
	let audioCtx = null;
	let playing = false;
	let scheduledOscs = [];
	let rafId = null;
	let playStartTime = 0;
	let stopFn = null;

	onMount(() => draw());
	onDestroy(() => {
		if (stopFn) stopFn();
		if (audioCtx) {
			audioCtx.close();
			audioCtx = null;
		}
	});

	// ---------------------------------------------------------------------------
	// Note helpers
	// ---------------------------------------------------------------------------
	const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

	function noteToMidi(note) {
		const m = note.match(/^([A-G])(#|b)?(\d)$/);
		if (!m) throw new Error(`Invalid note: ${note}`);
		let midi = SEMI[m[1]] + (parseInt(m[3]) + 1) * 12;
		if (m[2] === '#') midi++;
		if (m[2] === 'b') midi--;
		return midi;
	}

	function noteToFreq(note) {
		return 440 * Math.pow(2, (noteToMidi(note) - 69) / 12);
	}

	// ---------------------------------------------------------------------------
	// Draw
	// ---------------------------------------------------------------------------
	function draw() {
		if (!container || !data || !data.length) return;
		d3.select(container).selectAll('*').remove();

		// --- Layout ---
		const TITLE_H = 85;
		const CTRL_H = 40;
		const ML = spacing.marginDefault.left;
		const MR = spacing.marginDefault.right;
		const FOOTER_H = 36;
		const XAXIS_H = 18;
		const chartTop = TITLE_H + CTRL_H;
		const chartW = width - ML - MR;
		const chartH = height - chartTop - XAXIS_H - FOOTER_H;

		// --- Data analysis ---
		const uniqueNotes = [...new Set(data.map((d) => d.note))];
		uniqueNotes.sort((a, b) => noteToMidi(a) - noteToMidi(b));
		const maxTime = d3.max(data, (d) => d.start + d.length);

		// --- Scales ---
		const xScale = d3.scaleLinear().domain([0, maxTime]).range([0, chartW]);
		const yScale = d3.scaleBand().domain(uniqueNotes).range([chartH, 0]).padding(0.15);

		// --- SVG root ---
		const svg = createSvg(container, { width, height, ariaLabel: `${title} — data sonification` });

		// --- Furniture ---
		addFurniture(svg, { width, height, title, subtitle, source });

		// --- Controls ---
		const ctrlG = svg.append('g').attr('transform', `translate(${ML}, ${TITLE_H + 4})`);

		// Play button
		const playBtn = ctrlG
			.append('g')
			.attr('role', 'button')
			.attr('tabindex', 0)
			.attr('aria-label', 'Play sonification')
			.style('cursor', 'pointer')
			.style('outline', 'none');

		const playCircle = playBtn
			.append('circle')
			.attr('cx', 14)
			.attr('cy', 14)
			.attr('r', 14)
			.attr('fill', colors.sageDark);

		playBtn
			.append('polygon')
			.attr('points', '11,7 11,21 22,14')
			.attr('fill', colors.canvas);

		// Stop button
		const stopBtn = ctrlG
			.append('g')
			.attr('transform', 'translate(36, 0)')
			.attr('role', 'button')
			.attr('tabindex', 0)
			.attr('aria-label', 'Stop sonification')
			.style('cursor', 'pointer')
			.style('outline', 'none');

		const stopCircle = stopBtn
			.append('circle')
			.attr('cx', 14)
			.attr('cy', 14)
			.attr('r', 14)
			.attr('fill', colors.warmGray);

		stopBtn
			.append('rect')
			.attr('x', 8)
			.attr('y', 8)
			.attr('width', 12)
			.attr('height', 12)
			.attr('rx', 1)
			.attr('fill', colors.canvas);

		// Time display
		const timeText = ctrlG
			.append('text')
			.attr('x', 78)
			.attr('y', 19)
			.style('font-family', type.mono)
			.style('font-size', '12px')
			.style('fill', colors.warmGray)
			.text(`0.0 / ${maxTime.toFixed(1)}s`);

		// Hover feedback
		playBtn
			.on('mouseenter.hover', () => playCircle.attr('fill', colors.sageMid))
			.on('mouseleave.hover', () =>
				playCircle.attr('fill', playing ? colors.roseDark : colors.sageDark)
			);
		stopBtn
			.on('mouseenter.hover', () => stopCircle.attr('fill', colors.sageMid))
			.on('mouseleave.hover', () => stopCircle.attr('fill', colors.warmGray));

		// --- Chart area ---
		const chartG = svg.append('g').attr('transform', `translate(${ML}, ${chartTop})`);

		// Vertical grid lines (time)
		const timeTicks = xScale.ticks(10);
		timeTicks.forEach((t) => {
			chartG
				.append('line')
				.attr('x1', xScale(t))
				.attr('x2', xScale(t))
				.attr('y1', 0)
				.attr('y2', chartH)
				.attr('stroke', colors.gridLine)
				.attr('stroke-width', spacing.gridWidth);
		});

		// Horizontal lane dividers
		uniqueNotes.forEach((note) => {
			chartG
				.append('line')
				.attr('x1', 0)
				.attr('x2', chartW)
				.attr('y1', yScale(note) + yScale.bandwidth())
				.attr('y2', yScale(note) + yScale.bandwidth())
				.attr('stroke', colors.gridLine)
				.attr('stroke-width', spacing.gridWidth);
		});

		// Top border
		chartG
			.append('line')
			.attr('x1', 0)
			.attr('x2', chartW)
			.attr('y1', 0)
			.attr('y2', 0)
			.attr('stroke', colors.gridLine)
			.attr('stroke-width', spacing.gridWidth);

		// Note labels (y axis)
		uniqueNotes.forEach((note) => {
			chartG
				.append('text')
				.attr('x', -8)
				.attr('y', yScale(note) + yScale.bandwidth() / 2)
				.attr('text-anchor', 'end')
				.attr('dominant-baseline', 'middle')
				.style('font-family', type.mono)
				.style('font-size', '10px')
				.style('fill', colors.warmGray)
				.text(note);
		});

		// Time labels (x axis)
		timeTicks.forEach((t) => {
			chartG
				.append('text')
				.attr('x', xScale(t))
				.attr('y', chartH + 14)
				.attr('text-anchor', 'middle')
				.style('font-size', '9px')
				.style('fill', colors.warmGray)
				.text(`${t}s`);
		});

		// Note bars (piano roll)
		const bars = chartG
			.selectAll('.vl-note')
			.data(data)
			.join('rect')
			.attr('class', 'vl-note')
			.attr('x', (d) => xScale(d.start))
			.attr('y', (d) => yScale(d.note))
			.attr('width', (d) => Math.max(xScale(d.start + d.length) - xScale(d.start), 3))
			.attr('height', yScale.bandwidth())
			.attr('rx', spacing.cornerRadius)
			.attr('fill', colors.sageDark)
			.attr('opacity', 0.8);

		// Playhead
		const playheadLine = chartG
			.append('line')
			.attr('x1', 0)
			.attr('x2', 0)
			.attr('y1', -2)
			.attr('y2', chartH + 2)
			.attr('stroke', colors.roseDark)
			.attr('stroke-width', 1.5)
			.style('opacity', 0);

		// --- Playback ---
		function startPlayback() {
			if (playing) stopPlayback();

			if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
			if (audioCtx.state === 'suspended') audioCtx.resume();

			playing = true;
			playCircle.attr('fill', colors.roseDark);
			playStartTime = audioCtx.currentTime;

			// Schedule every note
			data.forEach((d) => {
				const freq = noteToFreq(d.note);
				const osc = audioCtx.createOscillator();
				const gain = audioCtx.createGain();

				osc.type = waveform;
				osc.frequency.value = freq;

				const t0 = playStartTime + d.start;
				const t1 = t0 + d.length;
				const decayEnd = t0 + Math.min(0.08, d.length * 0.4);

				// ADSR envelope
				gain.gain.setValueAtTime(0, t0);
				gain.gain.linearRampToValueAtTime(0.35, t0 + 0.008);
				gain.gain.exponentialRampToValueAtTime(0.12, decayEnd);
				gain.gain.setValueAtTime(0.12, Math.max(decayEnd, t1 - 0.025));
				gain.gain.exponentialRampToValueAtTime(0.001, t1);

				osc.connect(gain);
				gain.connect(audioCtx.destination);
				osc.start(t0);
				osc.stop(t1 + 0.01);

				scheduledOscs.push(osc);
			});

			playheadLine.style('opacity', 1);

			function tick() {
				if (!playing) return;
				const elapsed = audioCtx.currentTime - playStartTime;

				if (elapsed >= maxTime + 0.05) {
					stopPlayback();
					return;
				}

				const clamped = Math.min(elapsed, maxTime);
				playheadLine.attr('x1', xScale(clamped)).attr('x2', xScale(clamped));
				timeText.text(`${clamped.toFixed(1)} / ${maxTime.toFixed(1)}s`);

				bars
					.attr('fill', (d) => {
						if (elapsed >= d.start && elapsed <= d.start + d.length) return colors.roseDark;
						if (elapsed > d.start + d.length) return colors.sageMid;
						return colors.sageDark;
					})
					.attr('opacity', (d) => {
						if (elapsed >= d.start && elapsed <= d.start + d.length) return 1;
						if (elapsed > d.start + d.length) return 0.4;
						return 0.8;
					});

				rafId = requestAnimationFrame(tick);
			}

			rafId = requestAnimationFrame(tick);
		}

		function stopPlayback() {
			playing = false;
			if (rafId) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}

			scheduledOscs.forEach((osc) => {
				try {
					osc.stop();
				} catch (_) {
					/* already stopped */
				}
				try {
					osc.disconnect();
				} catch (_) {
					/* already disconnected */
				}
			});
			scheduledOscs = [];

			playCircle.attr('fill', colors.sageDark);
			playheadLine.style('opacity', 0).attr('x1', 0).attr('x2', 0);
			bars.attr('fill', colors.sageDark).attr('opacity', 0.8);
			timeText.text(`0.0 / ${maxTime.toFixed(1)}s`);
		}

		stopFn = stopPlayback;

		// Wire up controls
		function handleKey(event, fn) {
			if (event.key !== 'Enter' && event.key !== ' ') return;
			event.preventDefault();
			fn();
		}

		playBtn
			.on('click.sonif', () => startPlayback())
			.on('keydown.sonif', (event) => handleKey(event, startPlayback));

		stopBtn
			.on('click.sonif', () => stopPlayback())
			.on('keydown.sonif', (event) => handleKey(event, stopPlayback));

		// --- Accessibility table ---
		addA11yTable(svg.node(), {
			caption: `${title} — note data`,
			columns: [
				{ key: 'note', label: 'Note' },
				{ key: 'start', label: 'Start (s)' },
				{ key: 'length', label: 'Duration (s)' },
				{ key: 'freq', label: 'Frequency (Hz)' }
			],
			rows: data.map((d) => ({
				note: d.note,
				start: d.start.toFixed(2),
				length: d.length.toFixed(2),
				freq: noteToFreq(d.note).toFixed(1)
			}))
		});
	}
</script>

<div bind:this={container} style="position: relative; width: 100%; margin: 2rem 0;" />
