// vl-theme — design tokens
// Import what you need: import { colors, spacing } from '$lib/theme.js'

export const colors = {
	ink: '#1C2B1A',
	canvas: '#F5F0E8',

	sageDark: '#3D5C3A',
	sageMid: '#6B8C65',
	sageLight: '#A8C2A3',
	sagePale: '#D4E6D1',

	roseDark: '#A8324A',
	roseMid: '#E07088',
	roseLight: '#F4A8B8',
	rosePale: '#FADEDF',

	amber: '#C47A2B',
	teal: '#2A7A6E',
	warmGray: '#8A8780',

	highlight: '#A8324A',
	uncertain: '#8A8780',
	gridLine: '#E5E3DC'
};

export const categorical = [
	'#3D5C3A', // sage dark
	'#A8324A', // rose dark
	'#C47A2B', // amber
	'#2A7A6E', // teal
	'#6B8C65', // sage mid
	'#D4785A', // terracotta
	'#6B5EA8', // purple
	'#4A6E8A', // slate blue
	'#8C6A2A', // ochre
	'#7A3D5C', // plum
	'#2A6E4A', // forest
	'#8A8780'  // warm gray (neutral fallback)
];

export const type = {
	serif: "'Georgia', 'Times New Roman', serif",
	sans: "'Inter', 'Helvetica Neue', Arial, sans-serif",
	mono: "'JetBrains Mono', 'Fira Mono', monospace",
	chartTitle: 18,
	chartSubtitle: 14,
	axisLabel: 12,
	annotation: 12,
	footnote: 11,
	regular: 400,
	medium: 500
};

export const spacing = {
	marginDefault: { top: 32, right: 56, bottom: 48, left: 56 },
	marginWide: { top: 32, right: 48, bottom: 48, left: 56 },
	marginTight: { top: 24, right: 16, bottom: 40, left: 48 },
	labelPad: 8,
	titlePad: 16,
	annotPad: 6,
	cornerRadius: 3,
	dotRadius: 4,
	strokeWidth: 1.5,
	gridWidth: 0.5,
	axisWidth: 0.75
};

export const furniture = {
	title: {
		font: "'Georgia', serif",
		size: 18,
		weight: 400,
		color: '#1C2B1A',
		leading: 1.2
	},
	subtitle: {
		font: "'Inter', sans-serif",
		size: 13,
		weight: 400,
		color: '#3D5C3A',
		leading: 1.5
	},
	footnote: {
		font: "'Inter', sans-serif",
		size: 11,
		weight: 400,
		color: '#8A8780',
		prefix: 'Source: '
	},
	byline: {
		font: "'Inter', sans-serif",
		size: 11,
		weight: 500,
		color: '#3D5C3A',
		text: 'Victoria Labmayr'
	}
};

