<script>
	import { colors, type, furniture } from '$lib/chartUtils/theme.js';

	// --- Props ---
	export let width = 680;

	// --- Data: Statistics Canada merchandise trade, 2024 (C$ billions) ---
	// Formula: |deficit| / imports = "tariff charged"; halved = discounted rate; surplus = 10% floor
	const rawData = [
		{ country: 'United States', exports: 547.4, imports: 377.0 },
		{ country: 'China', exports: 29.3, imports: 88.8 },
		{ country: 'Mexico', exports: 8.1, imports: 47.3 },
		{ country: 'Germany', exports: 5.7, imports: 23.8 },
		{ country: 'Japan', exports: 14.8, imports: 21.4 },
		{ country: 'South Korea', exports: 7.5, imports: 16.9 },
		{ country: 'Italy', exports: 1.0, imports: 14.7 },
		{ country: 'India', exports: 3.1, imports: 12.5 },
		{ country: 'France', exports: 6.1, imports: 8.1 },
		{ country: 'United Kingdom', exports: 27.0, imports: 9.8 }
	];

	function calcRates(d) {
		const balance = d.exports - d.imports;
		if (balance >= 0) return { balance, charged: 10, discounted: 10, surplus: true };
		const charged = Math.round((Math.abs(balance) / d.imports) * 100);
		const discounted = Math.max(10, Math.round(charged / 2));
		return { balance, charged, discounted, surplus: false };
	}

	// Sort: surplus countries last, then by charged rate descending
	const rows = rawData
		.map((d) => ({ ...d, ...calcRates(d) }))
		.sort((a, b) => {
			if (a.surplus !== b.surplus) return a.surplus ? 1 : -1;
			return b.charged - a.charged;
		});

	const proclamationDate = 'April 16, 2025';
	const registrationNo = 'PC-2025-0416';
</script>

<!-- Outer page wrapper -->
<div
	class="proclamation"
	style="
		max-width: {width}px;
		background: {colors.canvas};
		font-family: {type.sans};
		color: {colors.ink};
	"
	role="main"
	aria-label="Canada Reciprocal Tariffs — satirical proclamation document"
>
	<!-- ── Letterhead ── -->
	<header class="letterhead">
		<div class="letterhead-left">
			<div class="maple-leaf" aria-hidden="true">🍁</div>
			<div class="wordmark">
				<span class="wordmark-en">Government of Canada</span>
				<span class="wordmark-fr">Gouvernement du Canada</span>
			</div>
		</div>
		<div class="reg-no">Reg. No. {registrationNo}</div>
	</header>

	<div class="red-rule" aria-hidden="true" />

	<!-- ── Document title block ── -->
	<div class="title-block">
		<p class="doc-type">Proclamation · Proclamation</p>
		<h1 class="doc-title">Day 14: Trade - Reciprocal Tariffs à la Trump.</h1>
		<p class="doc-subtitle">Pursuant to Canada's inherent right to apply elementary arithmetic</p>
	</div>

	<!-- ── Whereas clauses ── -->
	<section class="whereas-block" aria-label="Whereas clauses">
		A Proclamation Establishing Reciprocal Tariffs on Imports into Canada
	</section>

	<!-- ── Tariff table ── -->
	<section class="table-section" aria-label="Tariff schedule">
		<div class="table-header-row">
			<div class="col-country">Country</div>
			<div class="col-rate">
				Tariffs charged<br />to Canada<br />
				<span class="col-sub">incl. all unfairness</span>
			</div>
			<div class="col-rate">
				Canada's discounted<br />reciprocal tariffs
			</div>
		</div>

		{#each rows as row}
			<div class="table-row" class:surplus-row={row.surplus}>
				<div class="col-country">
					<span class="leaf-bullet" aria-hidden="true">🍁</span>
					{row.country}
				</div>
				<div class="col-rate">
					<span
						class="rate-pill"
						class:pill-deficit={!row.surplus}
						class:pill-surplus={row.surplus}
					>
						{row.charged}%
					</span>
				</div>
				<div class="col-rate">
					<span class="rate-pill pill-gold">
						{row.discounted}%
					</span>
				</div>
			</div>
		{/each}
	</section>

	<!-- ── Formula note ── -->
	<div class="formula-note">
		<strong>Methodology:</strong> "Tariff charged to Canada" = |Canada's trade deficit with country|
		÷ Canada's imports from that country. Discounted reciprocal rate = methodology result ÷ 2, minimum
		10%. Countries with which Canada runs a surplus receive the 10% baseline floor, as a gesture of good
		faith and mild condescension.
	</div>

	<!-- ── Footer ── -->
	<footer class="doc-footer">
		<div class="footer-left">
			<div>Proclaimed on {proclamationDate}</div>
			<div class="footer-source">
				Source: Statistics Canada, Table 12-10-0011-01. Merchandise trade, 2024.
			</div>
			<div class="footer-disclaimer">
				This proclamation is entirely hypothetical and presented for illustrative and satirical
				purposes. No tariffs were actually imposed in the making of this document. Canada remains
				polite.
			</div>
		</div>
		<div class="footer-byline">{furniture.byline.text}</div>
	</footer>

	<!-- Visually hidden accessibility table -->
	<div class="sr-only" aria-label="Data table">
		<table>
			<caption>Canada's hypothetical reciprocal tariffs by trading partner, 2024</caption>
			<thead>
				<tr>
					<th scope="col">Country</th>
					<th scope="col">Canada's exports (C$ bn)</th>
					<th scope="col">Canada's imports (C$ bn)</th>
					<th scope="col">Trade balance (C$ bn)</th>
					<th scope="col">Tariff charged to Canada (%)</th>
					<th scope="col">Canada's discounted reciprocal (%)</th>
				</tr>
			</thead>
			<tbody>
				{#each rows as row}
					<tr>
						<td>{row.country}</td>
						<td>{row.exports}</td>
						<td>{row.imports}</td>
						<td>{(row.exports - row.imports).toFixed(1)}</td>
						<td>{row.charged}%</td>
						<td>{row.discounted}%</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.proclamation {
		margin: 2rem auto;
		padding: 40px 48px 32px;
		border: 1px solid #c8c3b8;
		position: relative;
	}

	/* ── Letterhead ── */
	.letterhead {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}
	.letterhead-left {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.maple-leaf {
		font-size: 32px;
		line-height: 1;
	}
	.wordmark {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}
	.wordmark-en {
		font-size: 13px;
		font-weight: 500;
		color: #1c2b1a;
		letter-spacing: 0.01em;
	}
	.wordmark-fr {
		font-size: 11px;
		font-weight: 400;
		color: #8a8780;
		letter-spacing: 0.01em;
	}
	.reg-no {
		font-size: 10px;
		color: #8a8780;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	/* ── Red rule ── */
	.red-rule {
		height: 3px;
		background: #c4202a;
		margin-bottom: 20px;
	}

	/* ── Title block ── */
	.title-block {
		margin-bottom: 20px;
	}
	.doc-type {
		font-size: 10px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #8a8780;
		margin-bottom: 6px;
	}
	.doc-title {
		font-family: 'Georgia', 'Times New Roman', serif;
		font-size: 20px;
		font-weight: 400;
		line-height: 1.25;
		color: #1c2b1a;
		margin-bottom: 6px;
	}
	.doc-subtitle {
		font-size: 13px;
		color: #3d5c3a;
		font-style: italic;
	}

	/* ── Whereas ── */
	.whereas-block {
		border-left: 2px solid #d4e6d1;
		padding-left: 16px;
		margin-bottom: 24px;
	}
	.whereas {
		font-size: 12px;
		line-height: 1.7;
		color: #1c2b1a;
		margin-bottom: 10px;
	}
	.whereas:last-child {
		margin-bottom: 0;
	}
	.whereas strong {
		color: #3d5c3a;
		font-weight: 500;
	}

	/* ── Table ── */
	.table-section {
		margin-bottom: 16px;
	}
	.table-header-row,
	.table-row {
		display: grid;
		grid-template-columns: 1fr 160px 160px;
		align-items: center;
		gap: 0;
	}
	.table-header-row {
		border-bottom: 1.5px solid #1c2b1a;
		padding-bottom: 6px;
		margin-bottom: 2px;
	}
	.table-row {
		border-bottom: 0.5px solid #e5e3dc;
		padding: 5px 0;
	}
	.table-row:last-child {
		border-bottom: 1px solid #1c2b1a;
	}
	.surplus-row {
		opacity: 0.65;
	}
	.col-country {
		font-size: 12px;
		font-weight: 500;
		color: #1c2b1a;
		padding-right: 12px;
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.leaf-bullet {
		font-size: 10px;
		opacity: 0.5;
	}
	.col-rate {
		font-size: 9px;
		font-weight: 500;
		color: #8a8780;
		text-align: center;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		line-height: 1.4;
	}
	.col-sub {
		font-weight: 400;
		font-style: italic;
		opacity: 0.75;
	}

	/* Pill badges */
	.rate-pill {
		display: inline-block;
		padding: 3px 12px;
		border-radius: 3px;
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.01em;
		min-width: 52px;
		text-align: center;
	}
	.pill-deficit {
		background: #aecfcd;
		color: #0f4a44;
	}
	.pill-surplus {
		background: #e5e3dc;
		color: #8a8780;
	}
	.pill-gold {
		background: #f0b429;
		color: #3d2800;
	}

	/* ── Formula note ── */
	.formula-note {
		font-size: 11px;
		color: #8a8780;
		line-height: 1.6;
		border-top: 0.5px solid #e5e3dc;
		padding-top: 12px;
		margin-bottom: 16px;
	}

	/* ── Footer ── */
	.doc-footer {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 16px;
		border-top: 1px solid #8a8780;
		padding-top: 10px;
	}
	.footer-left {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.doc-footer > .footer-left > div:first-child {
		font-size: 11px;
		font-weight: 500;
		color: #3d5c3a;
	}
	.footer-source {
		font-size: 11px;
		color: #8a8780;
	}
	.footer-disclaimer {
		font-size: 10px;
		color: #8a8780;
		font-style: italic;
		max-width: 440px;
		line-height: 1.5;
	}
	.footer-byline {
		font-size: 11px;
		font-weight: 500;
		color: #3d5c3a;
		white-space: nowrap;
		flex-shrink: 0;
	}

	/* ── Accessibility ── */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
