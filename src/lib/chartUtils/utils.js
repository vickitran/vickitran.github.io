// vl chart utilities
// Import what you need: import { addFurniture, addDataBox, addA11yTable } from '$lib/chartUtils.js'
// All functions expect a d3 selection (svg) and your theme imports

import * as d3 from 'd3';
import { colors, type, spacing, furniture } from './theme.js';

// ---------------------------------------------------------------------------
// addFurniture — title, subtitle, source · byline footer
// ---------------------------------------------------------------------------
export function addFurniture(
	svg,
	{ width = 800, height = 500, title = '', subtitle = '', source = '' } = {}
) {
	const g = svg.append('g').attr('class', 'vl-furniture');

	if (title)
		g.append('text')
			.attr('x', spacing.marginDefault.left)
			.attr('y', 20)
			.style('font-family', furniture.title.font)
			.style('font-size', `${furniture.title.size}px`)
			.style('font-weight', furniture.title.weight)
			.style('fill', furniture.title.color)
			.text(title);

	if (subtitle)
		g.append('text')
			.attr('x', spacing.marginDefault.left)
			.attr('y', title ? 40 : 20)
			.style('font-family', furniture.subtitle.font)
			.style('font-size', `${furniture.subtitle.size}px`)
			.style('fill', furniture.subtitle.color)
			.text(subtitle);

	const footerParts = [];
	if (source) footerParts.push(`${furniture.footnote.prefix}${source}`);
	footerParts.push(furniture.byline.text);

	g.append('text')
		.attr('x', spacing.marginDefault.left)
		.attr('y', height - 8)
		.style('font-family', furniture.footnote.font)
		.style('font-size', `${furniture.footnote.size}px`)
		.style('fill', furniture.footnote.color)
		.text(footerParts.join('  ·  '));

	return g;
}

// ---------------------------------------------------------------------------
// addA11yTable — visually hidden HTML table for screen readers
// ---------------------------------------------------------------------------
export function addA11yTable(svgNode, { caption = '', columns = [], rows = [] } = {}) {
	const container = svgNode.parentNode;
	if (!container) return;

	const prev = container.querySelector('.vl-a11y-table');
	if (prev) prev.remove();

	const wrapper = document.createElement('div');
	wrapper.className = 'vl-a11y-table';
	wrapper.setAttribute('aria-hidden', 'false');
	Object.assign(wrapper.style, {
		position: 'absolute',
		width: '1px',
		height: '1px',
		overflow: 'hidden',
		clip: 'rect(0,0,0,0)',
		whiteSpace: 'nowrap',
		border: '0'
	});

	const table = document.createElement('table');

	if (caption) {
		const cap = document.createElement('caption');
		cap.textContent = caption;
		table.appendChild(cap);
	}

	const thead = document.createElement('thead');
	const headerRow = document.createElement('tr');
	columns.forEach(({ label }) => {
		const th = document.createElement('th');
		th.scope = 'col';
		th.textContent = label;
		headerRow.appendChild(th);
	});
	thead.appendChild(headerRow);
	table.appendChild(thead);

	const tbody = document.createElement('tbody');
	rows.forEach((row) => {
		const tr = document.createElement('tr');
		columns.forEach(({ key }) => {
			const td = document.createElement('td');
			td.textContent = row[key] ?? '';
			tr.appendChild(td);
		});
		tbody.appendChild(tr);
	});
	table.appendChild(tbody);
	wrapper.appendChild(table);

	if (getComputedStyle(container).position === 'static') {
		container.style.position = 'relative';
	}

	container.appendChild(wrapper);
	return wrapper;
}

// ---------------------------------------------------------------------------
// addDataBox — interactive data callout with accent bar, field labels, clear btn
// Usage:
//   const box = addDataBox(svg, { width, height, fields, total, y })
//   box.bind(leafSelection, d => d.data, d => colorScale(d.data.group))
// ---------------------------------------------------------------------------
export function addDataBox(
	svg,
	{
		width = 800,
		height = 500,
		fields = ['name', 'group', 'value', 'pct'],
		total = null,
		y = 80
	} = {}
) {
	const L = spacing.marginDefault.left;
	const BAR_W = 4;
	const PAD_X = 12;
	const PAD_Y = 6;
	const SEP_W = 1;
	const SEP_GAP = 10;
	const KEY_SIZE = 11;
	const VAL_SIZE = 14;
	const BOX_H = KEY_SIZE + 2 + VAL_SIZE + PAD_Y * 2;
	const BOX_Y = y - PAD_Y;

	// Live region for screen reader announcements
	const liveRegion = document.createElement('div');
	liveRegion.setAttribute('aria-live', 'polite');
	liveRegion.setAttribute('aria-atomic', 'true');
	Object.assign(liveRegion.style, {
		position: 'absolute',
		width: '1px',
		height: '1px',
		overflow: 'hidden',
		clip: 'rect(0,0,0,0)',
		whiteSpace: 'nowrap',
		border: '0'
	});
	const svgParent = svg.node().parentNode;
	if (svgParent) {
		if (getComputedStyle(svgParent).position === 'static') {
			svgParent.style.position = 'relative';
		}
		svgParent.appendChild(liveRegion);
	}

	const g = svg
		.append('g')
		.attr('class', 'vl-databox')
		.attr('transform', `translate(${L}, ${BOX_Y})`);

	const bgRect = g
		.append('rect')
		.attr('x', 0)
		.attr('y', 0)
		.attr('height', BOX_H)
		.attr('fill', '#EDE8DC')
		.style('opacity', 0);

	const accentBar = g
		.append('rect')
		.attr('x', 9999)
		.attr('y', 0) // off-screen until reflow positions it on the right
		.attr('width', BAR_W)
		.attr('height', BOX_H)
		.attr('rx', 1)
		.attr('fill', colors.ink)
		.style('opacity', 0);

	const prompt = g
		.append('text')
		.attr('x', PAD_X)
		.attr('y', BOX_H / 2 + 4)
		.style('font-family', type.sans)
		.style('font-size', '13px')
		.style('fill', colors.warmGray)
		.style('font-style', 'italic')
		.text('Tap a data point to explore');

	const fieldGroups = [];
	fields.forEach((field, i) => {
		const fg = g.append('g').style('opacity', 0);
		let sep = null;
		if (i > 0) {
			sep = fg
				.append('rect')
				.attr('y', PAD_Y)
				.attr('width', SEP_W)
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
			.text(field === 'pct' ? 'share' : field);
		const valEl = fg
			.append('text')
			.attr('y', PAD_Y + KEY_SIZE + 3 + VAL_SIZE)
			.style('font-family', type.sans)
			.style('font-size', `${VAL_SIZE}px`)
			.style('font-weight', 500)
			.style('fill', colors.ink)
			.text('');
		fieldGroups.push({ field, fg, sep, keyEl, valEl });
	});

	function reflow() {
		let cursor = PAD_X;
		fieldGroups.forEach(({ sep, keyEl, valEl }, i) => {
			if (i > 0) {
				sep.attr('x', cursor);
				cursor += SEP_W + SEP_GAP;
			}
			keyEl.attr('x', cursor);
			valEl.attr('x', cursor);
			cursor +=
				Math.max(keyEl.node().getComputedTextLength(), valEl.node().getComputedTextLength()) +
				PAD_X;
		});
		bgRect.attr('width', cursor + BAR_W);
		accentBar.attr('x', cursor);
	}

	// Clear button
	const BTN_W = 54;
	const BTN_H = 18;
	const BTN_X = width - spacing.marginDefault.right - BTN_W;
	const BTN_Y = BOX_Y + (BOX_H - BTN_H) / 2;

	const btnG = svg
		.append('g')
		.attr('transform', `translate(${BTN_X}, ${BTN_Y})`)
		.style('cursor', 'pointer')
		.style('opacity', 0)
		.style('pointer-events', 'none');

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

	const box = {
		show(d) {
			prompt.style('opacity', 0);
			accentBar.style('opacity', 1);
			bgRect.style('opacity', 1);

			const announceParts = [];
			fieldGroups.forEach(({ field, fg, valEl }) => {
				let val = '';
				if (field === 'pct' && total != null) {
					val = `${((d.value / total) * 100).toFixed(1)}%`;
					announceParts.push(`share: ${val}`);
				} else if (field === 'value') {
					val = typeof d.value === 'number' ? d.value.toLocaleString() : d.value ?? '';
					announceParts.push(`value: ${val}`);
				} else {
					val = d[field] ?? '';
					announceParts.push(`${field}: ${val}`);
				}
				valEl.text(val);
				fg.style('opacity', 1);
			});

			reflow();
			btnG.style('opacity', 1).style('pointer-events', 'all');
			liveRegion.textContent = announceParts.join(', ');
		},

		setColor(color) {
			fieldGroups.forEach(({ valEl }) => valEl.style('fill', color));
			accentBar.attr('fill', color);
		},

		clear() {
			prompt.style('opacity', 1);
			accentBar.attr('fill', colors.ink).style('opacity', 0);
			bgRect.style('opacity', 0);
			fieldGroups.forEach(({ fg, valEl }) => {
				fg.style('opacity', 0);
				valEl.style('fill', colors.ink);
			});
			btnG.style('opacity', 0).style('pointer-events', 'none');
			liveRegion.textContent = 'Selection cleared';
		},

		bind(selection, dataFn = (d) => d, colorFn = null) {
			let active = null;
			let overlayRect = null;

			function reset() {
				active = null;
				if (overlayRect) {
					overlayRect.remove();
					overlayRect = null;
				}
				selection.selectAll('rect.vl-selection-overlay').remove();
				// Restore all tiles
				selection.style('opacity', null);
				box.clear();
			}

			function select(node, d) {
				active = node;
				const sel = d3.select(node);

				if (overlayRect) {
					overlayRect.remove();
					overlayRect = null;
				}
				selection.selectAll('rect.vl-selection-overlay').remove();

				// Dim all tiles, then restore the selected one
				selection.style('opacity', 0.3);
				sel.style('opacity', 1);

				const tileRectNode = sel.select('rect').node();
				const tileW = +tileRectNode.getAttribute('width');
				const tileH = +tileRectNode.getAttribute('height');
				const tileRx = +tileRectNode.getAttribute('rx') || 3;

				overlayRect = sel
					.append('rect')
					.attr('class', 'vl-selection-overlay')
					.attr('x', tileW - 12)
					.attr('width', 12)
					.attr('height', tileH)
					.attr('rx', tileRx)
					.attr('fill', 'rgba(28,43,26,0.75)')
					.attr('pointer-events', 'none')
					.node();

				box.show(dataFn(d));
				if (colorFn) box.setColor(colorFn(d));
			}

			selection
				.attr('role', 'button')
				.attr('tabindex', 0)
				.attr('aria-label', (d) => {
					const data = dataFn(d);
					const pct = total ? ` ${((data.value / total) * 100).toFixed(1)} percent` : '';
					return `${data.name ?? ''}, ${data.group ?? ''}, value ${
						data.value?.toLocaleString() ?? ''
					}${pct}`;
				})
				.style('cursor', 'pointer')
				.style('outline', 'none')
				.style('-webkit-tap-highlight-color', 'transparent')
				.on('click.databox touchstart.databox keydown.databox', function (event, d) {
					if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
					if (event.type === 'keydown') event.preventDefault();
					event.stopPropagation();
					active === this ? reset() : select(this, d);
				});

			svg.on('click.databox touchstart.databox', () => reset());

			btnG
				.attr('role', 'button')
				.attr('tabindex', 0)
				.attr('aria-label', 'Clear selection')
				.on('click.databox touchstart.databox keydown.databox', function (event) {
					if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
					event.stopPropagation();
					reset();
				});

			return box;
		}
	};

	return box;
}
