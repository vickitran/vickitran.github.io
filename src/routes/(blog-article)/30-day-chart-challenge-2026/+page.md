---
slug: 30-day-chart-challenge-2026
title: 30 Day Chart Challenge 2026
coverImage: ""
excerpt: A month long chart making routine
date: 2026-04-01T10:15:02.320Z
updated: 2026-04-16T08:43:10.186Z
hidden: false
tags: []
keywords: []
---
<script>
  import Treemap from '$lib/components/charts/Treemap.svelte'
  import PictogramSlope from '$lib/components/charts/PictogramSlope.svelte'
  import WaffleChart from '$lib/components/charts/WaffleChart.svelte'
  import SlopeChart from '$lib/components/charts/SlopeChart.svelte'
  import RadialBar from '$lib/components/charts/RadialBar.svelte'
  import BarChart from '$lib/components/charts/BarChart.svelte'
  import RidgeLineDensity from '$lib/components/charts/RidgeLineDensity.svelte'
  import SmallMultipleLines from '$lib/components/charts/SmallMultipleLines.svelte'
  import Sonification from '$lib/components/charts/Sonification.svelte'
  import Pressfreedommap from '$lib/components/charts/Pressfreedommap.svelte'
  import MediaAttentionChart from '$lib/components/charts/MediaAttentionChart.svelte'
  import Canadareciprocaltariffs from '$lib/components/charts/Canadareciprocaltariffs.svelte'
  import Dragonbabies from '$lib/components/charts/Dragonbabies.svelte'
  import Incidentsvsaireleases from '$lib/components/charts/Incidentsvsaireleases.svelte' 
  import Labourcosteurope from '$lib/components/charts/Labourcosteurope.svelte' 

  const treemapData = {
    name: 'root',
    children: [
      { name: 'Fingering',       value: 13, group: 'Fine'   },
      { name: 'Light Fingering', value: 11, group: 'Fine'   },
      { name: 'Sport',           value: 10, group: 'Fine'   },
      { name: 'Lace',            value:  1, group: 'Fine'   },
      { name: 'Aran',            value: 11, group: 'Medium' },
      { name: 'DK',              value: 31, group: 'Medium' },
      { name: 'Worsted',         value: 15, group: 'Medium' },
      { name: 'Bulky',           value:  3, group: 'Bulky'  },
      { name: 'Any gauge',       value:  2, group: 'Other'  },
      { name: 'Null',            value:  3, group: 'Other'  }
    ]
  }

  const pictogramData = [
    { year: 2012, visits: 18872613 },
    { year: 2013, visits: 18485394 },
    { year: 2014, visits: 18335931 },
    { year: 2015, visits: 18153077 },
    { year: 2016, visits: 18232367 },
    { year: 2017, visits: 17370032 },
    { year: 2018, visits: 17577373 },
    { year: 2019, visits: 17248761 },
    { year: 2020, visits: 5557751  },
    { year: 2021, visits: 4029488  },
    { year: 2022, visits: 9566486  },
    { year: 2023, visits: 12507823 }
  ]

  const skiData = [
    { name: 'Tyrol',         value: 128 },
    { name: 'Styria',        value: 77  },
    { name: 'Salzburg',      value: 56  },
    { name: 'Vorarlberg',    value: 41  },
    { name: 'Lower Austria', value: 32  },
    { name: 'Carinthia',     value: 31  },
    { name: 'Upper Austria', value: 30  },
    { name: 'Burgenland',    value: 2   },
    { name: 'Vienna',        value: 1   }
  ]

	const internetData = {
		fixed: {
			label: 'Day 8: Circular - Fixed broadband download speeds, 2024',
			unit: 'Mbps',
			avg: 112.5,
			total: 252,
			maxVal: 400,
			top5: [
				{ display: 'Reunion', name: 'Reunion', mbps: 369.3, rank: 1 },
				{ display: 'Singapore', name: 'Singapore', mbps: 358.0, rank: 2 },
				{ display: 'Hong Kong SAR', name: 'Hong Kong SAR, China', mbps: 342.2, rank: 3 },
				{ display: 'Chile', name: 'Chile', mbps: 334.5, rank: 4 },
				{ display: 'France', name: 'France', mbps: 319.0, rank: 5 }
			],
			bot5: [
				{ display: 'Turkmenistan', name: 'Turkmenistan', mbps: 16.0, rank: 248 },
				{ display: 'Syria', name: 'Syrian Arab Republic', mbps: 14.9, rank: 249 },
				{ display: 'Gambia', name: 'Gambia, The', mbps: 13.9, rank: 250 },
				{ display: 'Tunisia', name: 'Tunisia', mbps: 13.4, rank: 251 },
				{ display: 'Afghanistan', name: 'Afghanistan', mbps: 7.3, rank: 252 }
			]
		},
		mobile: {
			label: 'Day 8: Circular - Mobile download speeds, 2024',
			unit: 'Mbps',
			avg: 84.9,
			total: 249,
			maxVal: 550,
			top5: [
				{ display: 'Dem. Rep. Korea', name: "Korea, Dem. People's Rep.", mbps: 526.6, rank: 1 },
				{ display: 'UAE', name: 'United Arab Emirates', mbps: 428.9, rank: 2 },
				{ display: 'Qatar', name: 'Qatar', mbps: 355.2, rank: 3 },
				{ display: 'South Korea', name: 'Korea, Rep.', mbps: 329.7, rank: 4 },
				{ display: 'Svalbard', name: 'Svalbard', mbps: 298.1, rank: 5 }
			],
			bot5: [
				{ display: 'Cuba', name: 'Cuba', mbps: 8.9, rank: 245 },
				{ display: 'Niue', name: 'Niue', mbps: 8.6, rank: 246 },
				{ display: 'US Minor Islands', name: 'US Minor Outlying Islands', mbps: 7.7, rank: 247 },
				{ display: 'Eritrea', name: 'Eritrea', mbps: 3.3, rank: 248 },
				{ display: 'Wallis & Futuna', name: 'Wallis-et-Futuna (Fr.)', mbps: 1.3, rank: 249 }
			]
		}
	};

  const racoonData = [ {
    "label": "Etobicoke-Lakeshore",
    "February": 3051,
    "January": 3259,
    "March": 3263
  },
  {
    "label": "Spadina-Fort York",
    "February": 3418,
    "January": 3683,
    "March": 3561
  },
  {
    "label": "York Centre",
    "February": 2610,
    "January": 2774,
    "March": 2728
  },
  {
    "label": "University-Rosedale",
    "February": 4262,
    "January": 4463,
    "March": 4398
  },
  {
    "label": "Davenport",
    "February": 3624,
    "January": 3823,
    "March": 3792
  },
  {
    "label": "Parkdale-High Park",
    "February": 4816,
    "January": 5023,
    "March": 5051
  },
  {
    "label": "Toronto-Danforth",
    "February": 3911,
    "January": 4155,
    "March": 4088
  },
  {
    "label": "Toronto Centre",
    "February": 3640,
    "January": 3897,
    "March": 3795
  },
  {
    "label": "Scarborough Southwest",
    "February": 2662,
    "January": 2767,
    "March": 2710
  },
  {
    "label": "Beaches-East York",
    "February": 3383,
    "January": 3637,
    "March": 3500
  }
];

const flowingData = [
		{ country: 'Israel', president: '(Obama/Biden)', value: 85 },
    { country: 'Israel', president:  'Trump', value: 84 },
    { country: 'Micronesia', president: '(Obama/Biden)', value: 82 },
    { country: 'Micronesia', president:  'Trump', value: 69 },
    { country: 'Canada', president: '(Obama/Biden)', value: 78 },
    { country: 'Canada', president:  'Trump', value: 61 },
    { country: 'Australia', president: '(Obama/Biden)', value: 70 },
    { country: 'Australia', president:  'Trump', value: 61 },
    { country: 'United Kingdom', president: '(Obama/Biden)', value: 68 },
    { country: 'United Kingdom', president:  'Trump', value: 55 },

	];

const raverlyPriceData = [
  {
    group: "Clothing Items",
    values: [
      // Cardigan
      10.74, 9.35, 7.83, 6.43, 7.83, 9.35, 6.43, 9.35, 9.35, 6.43, 9.35,
      8.17, 8.16, 7.83, 7.58, 8.17, 9.35, 9.35, 10.05, 7.58, 7.28, 8.22,
      7.58, 3.99, 8.00, 8.00, 10.00, 9.00, 9.00, 7.58, 9.94, 9.35, 9.35,
      7.83, 6.00, 7.83,
      // Pullover
      7.83, 7.83, 8.61, 7.83, 7.83, 8.61, 8.22, 7.83, 7.83, 6.50, 7.83,
      7.83, 8.42, 7.83, 8.61, 7.83, 7.83, 8.43, 9.35, 9.35, 8.00, 6.50,
      8.19, 8.00, 8.50, 9.00, 8.00, 9.00, 7.83, 8.07, 8.19, 6.43, 7.83,
      7.83, 8.61, 7.83, 8.42, 8.19, 8.61, 9.35, 7.83, 6.43, 7.83, 7.83,
      9.00, 9.00, 7.83, 8.61, 5.16, 8.61, 9.35, 9.35, 8.43, 6.43, 7.00,
      9.00, 8.00, 10.00, 8.00, 7.00, 8.00, 10.59, 7.00, 6.50, 10.00,
      12.00, 9.00, 6.50, 8.75, 8.00, 9.00, 7.00, 10.00,
      // Tee
      8.77, 8.00, 7.83, 7.83, 7.83, 7.83, 9.35, 6.38, 6.38, 7.83, 7.83,
      7.83, 7.83, 8.50, 7.00, 7.00, 7.83, 8.00, 8.17, 9.35, 7.83, 7.02,
      7.00, 6.43, 8.00, 10.50, 7.00, 8.00, 8.30, 7.83, 5.48,
      // Vest
      10.74, 5.00,
      // Jacket
      10.00, 10.73,
      // Tank/Camisole
      7.83, 8.61, 8.61, 7.83, 6.43, 8.19, 10.00, 8.18, 7.00, 5.28,
      // Dress/Suit
      12.51,
      // Shawl/Wrap
      8.05, 7.02, 5.50, 6.00, 7.00, 7.83, 6.00, 6.43, 7.00, 5.00, 5.00,
      7.02, 7.00, 6.50, 6.00, 5.00, 8.17, 5.00, 7.00, 7.00, 8.17, 6.00,
      7.00, 8.00, 5.00, 7.00, 7.00, 8.00, 7.00, 7.99, 5.48, 7.00, 6.43,
      6.00, 6.00, 7.00, 7.00, 6.51, 5.38, 4.60, 15.00, 15.00
    ]
  },
  {
    group: "Clothing Accessories",
    values: [
      // Hat
      2.22, 5.50, 4.99, 4.00, 6.00, 5.50, 5.50, 4.00,
      // Socks
      6.43, 4.00, 14.99, 7.00, 7.00,
      // Mittens/Gloves
      3.51, 3.51, 5.00, 7.61, 3.49,
      // Scarf
      5.48, 5.48, 7.83, 7.83, 8.61, 8.61, 7.83, 6.86, 5.48, 4.09, 8.27,
      5.00, 7.00, 5.74, 7.00, 6.00, 4.00, 7.00, 5.00,
      // Bag
      10.74, 5.20, 9.05, 7.77, 6.51,
      // Child
      4.68, 7.02, 7.02, 15.00,
      // Baby
      5.05
    ]
  },
  {
    group: "Others",
    values: [
      // Knitting
      5.50, 6.00, 5.50, 11.69, 3.72, 3.73, 5.17, 8.50, 9.93, 6.43, 9.93,
      8.17, 5.85, 8.50, 5.00, 8.17, 5.85, 9.93, 2.50, 5.00, 6.00, 5.80,
      4.50, 7.00, 8.00, 8.50, 6.00, 8.00,
      // Fingering
      7.00, 3.00, 2.00, 6.50, 7.61, 8.00, 6.50,
      // Fingering (14 wpi)
      7.00, 7.00, 7.61, 7.00, 5.84, 6.50, 7.00, 8.77, 8.00, 7.00, 7.61, 7.00,
      // Light Fingering
      7.00, 5.95, 6.00,
      // DK
      7.00, 4.50, 5.50, 9.50, 7.00,
      // Aran
      7.58, 6.00, 7.00,
      // Worsted (9 wpi)
      9.50, 6.00, 4.68,
      // Sport
      6.50, 7.00, 6.95,
      // Blanket
      9.00, 2.22, 11.68,
      // Home
      5.00, 4.00, 7.00, 6.00,
      // Toys
      4.00, 4.00, 1.52, 7.70, 2.34, 6.50, 7.02, 3.51, 8.00,
      // Crochet
      3.50, 6.50, 4.68, 6.50,
      // Dishcloth
      6.00,
      // Other
      2.50, 2.50, 6.00, 3.50, 8.17, 10.50
    ]
  }
];

const taylorSwiftSpeechinessData = [
  {
    group: '2006–2010',
    values: [
      0.0231, 0.0239, 0.0243, 0.0246, 0.0251, 0.0252, 0.0256, 0.0257, 0.0258,
      0.026, 0.0263, 0.0264, 0.0266, 0.0267, 0.0269, 0.027, 0.0271, 0.0273,
      0.0275, 0.0278, 0.0282, 0.0285, 0.0287, 0.0289, 0.0291, 0.0292, 0.0293,
      0.0294, 0.0297, 0.0298, 0.0301, 0.0303, 0.0305, 0.0306, 0.0308, 0.0311,
      0.0317, 0.0318, 0.0322, 0.0323, 0.0324, 0.0329, 0.0331, 0.0335, 0.0337,
      0.0339, 0.0341, 0.0347, 0.036, 0.0365, 0.037, 0.0373, 0.0374, 0.0377,
      0.0381, 0.0384, 0.0386, 0.0392, 0.0393, 0.041, 0.0418, 0.0426, 0.0467,
      0.0496, 0.0524, 0.0537, 0.0549
    ]
  },
  {
    group: '2010–2020',
    values: [
      0.0234, 0.0243, 0.0245, 0.0246, 0.0254, 0.0256, 0.0257, 0.0263, 0.0269,
      0.027, 0.0271, 0.0272, 0.0275, 0.0276, 0.0279, 0.0281, 0.0284, 0.0285,
      0.0287, 0.029, 0.0293, 0.0302, 0.0304, 0.0305, 0.0309, 0.0315, 0.0318,
      0.0319, 0.0321, 0.0323, 0.0324, 0.0328, 0.0333, 0.0334, 0.0337, 0.0344,
      0.0346, 0.035, 0.0354, 0.0355, 0.0358, 0.0363, 0.0369, 0.0372, 0.0376,
      0.0377, 0.0378, 0.0379, 0.0382, 0.0386, 0.0391, 0.0396, 0.0397, 0.0398,
      0.0401, 0.0402, 0.0406, 0.0412, 0.0423, 0.0427, 0.0437, 0.0492, 0.0497,
      0.05, 0.0503, 0.0504, 0.0511, 0.0533, 0.0538, 0.054, 0.0549, 0.0553,
      0.0558, 0.0563, 0.0569, 0.0571, 0.0587, 0.0605, 0.0622, 0.0629, 0.0641,
      0.0646, 0.0661, 0.0676, 0.0682, 0.0709, 0.071, 0.0715, 0.0719, 0.0731,
      0.0732, 0.0736, 0.0741, 0.0774, 0.0827, 0.0897, 0.0904, 0.0916, 0.0919,
      0.102, 0.115, 0.123, 0.127
    ]
  },
  {
    group: '2020–present',
    values: [
      0.025, 0.0253, 0.0255, 0.0256, 0.0257, 0.0261, 0.0263, 0.0264, 0.0269,
      0.0272, 0.0273, 0.0274, 0.0275, 0.0277, 0.0278, 0.0281, 0.0282, 0.0283,
      0.0285, 0.0286, 0.0287, 0.0288, 0.029, 0.0293, 0.0296, 0.0297, 0.0298,
      0.0299, 0.03, 0.0301, 0.0302, 0.0303, 0.0306, 0.0308, 0.031, 0.0312,
      0.0316, 0.0317, 0.0319, 0.032, 0.0322, 0.0324, 0.0326, 0.0328, 0.0329,
      0.0331, 0.0334, 0.0338, 0.034, 0.0341, 0.0342, 0.0344, 0.0346, 0.0347,
      0.0349, 0.035, 0.0351, 0.0353, 0.0356, 0.0357, 0.0358, 0.0361, 0.0363,
      0.0365, 0.0372, 0.0375, 0.0376, 0.0377, 0.0379, 0.038, 0.0382, 0.0383,
      0.0384, 0.0392, 0.0394, 0.0397, 0.0399, 0.0403, 0.0408, 0.0409, 0.0413,
      0.0415, 0.0417, 0.0419, 0.0424, 0.0439, 0.0441, 0.0444, 0.0446, 0.0447,
      0.045, 0.0455, 0.0456, 0.0466, 0.0468, 0.0471, 0.0472, 0.048, 0.0483,
      0.0484, 0.0486, 0.0488, 0.0489, 0.0492, 0.0495, 0.05, 0.0502, 0.0503,
      0.0507, 0.0521, 0.0522, 0.0526, 0.0535, 0.0537, 0.0539, 0.0543, 0.0545,
      0.055, 0.0563, 0.0564, 0.0574, 0.0577, 0.0581, 0.0583, 0.0595, 0.0598,
      0.0616, 0.0617, 0.062, 0.0628, 0.0629, 0.0633, 0.0638, 0.0645, 0.0647,
      0.065, 0.069, 0.0738, 0.0748, 0.0771, 0.0778, 0.0787, 0.0821, 0.085,
      0.0883, 0.0889, 0.0916, 0.0931
    ]
  },
];

const irrigationData = [
  {
    "label": "Other animal feed",
    "series": [
      {
        "x": 2008,
        "y": 55.2984
      },
      {
        "x": 2009,
        "y": 51.5608
      },
      {
        "x": 2010,
        "y": 47.2703
      },
      {
        "x": 2011,
        "y": 47.9956
      },
      {
        "x": 2012,
        "y": 55.7053
      },
      {
        "x": 2013,
        "y": 50.7385
      },
      {
        "x": 2014,
        "y": 54.065
      },
      {
        "x": 2015,
        "y": 47.3392
      },
      {
        "x": 2016,
        "y": 60.4964
      },
      {
        "x": 2017,
        "y": 62.5986
      },
      {
        "x": 2018,
        "y": 65.1296
      },
      {
        "x": 2019,
        "y": 57.9788
      },
      {
        "x": 2020,
        "y": 66.3947
      }
    ]
  },
  {
    "label": "Other produce",
    "series": [
      {
        "x": 2008,
        "y": 26.9812
      },
      {
        "x": 2009,
        "y": 27.0341
      },
      {
        "x": 2010,
        "y": 21.8628
      },
      {
        "x": 2011,
        "y": 22.103
      },
      {
        "x": 2012,
        "y": 29.5011
      },
      {
        "x": 2013,
        "y": 29.8248
      },
      {
        "x": 2014,
        "y": 27.6181
      },
      {
        "x": 2015,
        "y": 28.6151
      },
      {
        "x": 2016,
        "y": 24.7036
      },
      {
        "x": 2017,
        "y": 25.6307
      },
      {
        "x": 2018,
        "y": 27.0178
      },
      {
        "x": 2019,
        "y": 23.5855
      },
      {
        "x": 2020,
        "y": 29.2458
      }
    ]
  },
  {
    "label": "Wheat",
    "series": [
      {
        "x": 2008,
        "y": 22.7651
      },
      {
        "x": 2009,
        "y": 19.078
      },
      {
        "x": 2010,
        "y": 20.819
      },
      {
        "x": 2011,
        "y": 19.1717
      },
      {
        "x": 2012,
        "y": 22.1769
      },
      {
        "x": 2013,
        "y": 19.8827
      },
      {
        "x": 2014,
        "y": 17.0099
      },
      {
        "x": 2015,
        "y": 16.8132
      },
      {
        "x": 2016,
        "y": 16.0093
      },
      {
        "x": 2017,
        "y": 15.9745
      },
      {
        "x": 2018,
        "y": 14.6962
      },
      {
        "x": 2019,
        "y": 13.965
      },
      {
        "x": 2020,
        "y": 15.4416
      }
    ]
  },
  {
    "label": "Corn",
    "series": [
      {
        "x": 2008,
        "y": 16.1331
      },
      {
        "x": 2009,
        "y": 14.6234
      },
      {
        "x": 2010,
        "y": 13.5275
      },
      {
        "x": 2011,
        "y": 15.4298
      },
      {
        "x": 2012,
        "y": 16.5942
      },
      {
        "x": 2013,
        "y": 15.1019
      },
      {
        "x": 2014,
        "y": 12.2535
      },
      {
        "x": 2015,
        "y": 10.0896
      },
      {
        "x": 2016,
        "y": 14.0179
      },
      {
        "x": 2017,
        "y": 14.3474
      },
      {
        "x": 2018,
        "y": 17.1409
      },
      {
        "x": 2019,
        "y": 16.9879
      },
      {
        "x": 2020,
        "y": 14.3962
      }
    ]
  },
  {
    "label": "Rice",
    "series": [
      {
        "x": 2008,
        "y": 19.4168
      },
      {
        "x": 2009,
        "y": 22.8569
      },
      {
        "x": 2010,
        "y": 7.0928
      },
      {
        "x": 2011,
        "y": 15.9687
      },
      {
        "x": 2012,
        "y": 15.7697
      },
      {
        "x": 2013,
        "y": 16.7057
      },
      {
        "x": 2014,
        "y": 22.1655
      },
      {
        "x": 2015,
        "y": 2.8075
      },
      {
        "x": 2016,
        "y": 6.3509
      },
      {
        "x": 2017,
        "y": 4.795
      },
      {
        "x": 2018,
        "y": 5.8901
      },
      {
        "x": 2019,
        "y": 4.9634
      },
      {
        "x": 2020,
        "y": 7.6298
      }
    ]
  },
  {
    "label": "Barley",
    "series": [
      {
        "x": 2008,
        "y": 4.2672
      },
      {
        "x": 2009,
        "y": 3.5006
      },
      {
        "x": 2010,
        "y": 4.2337
      },
      {
        "x": 2011,
        "y": 4.3794
      },
      {
        "x": 2012,
        "y": 6.2036
      },
      {
        "x": 2013,
        "y": 4.6747
      },
      {
        "x": 2014,
        "y": 3.1121
      },
      {
        "x": 2015,
        "y": 4.8665
      },
      {
        "x": 2016,
        "y": 4.0099
      },
      {
        "x": 2017,
        "y": 3.7879
      },
      {
        "x": 2018,
        "y": 3.4712
      },
      {
        "x": 2019,
        "y": 3.1688
      },
      {
        "x": 2020,
        "y": 3.7047
      }
    ]
  },
  {
    "label": "Cotton",
    "series": [
      {
        "x": 2008,
        "y": 4.5697
      },
      {
        "x": 2009,
        "y": 4.0948
      },
      {
        "x": 2010,
        "y": 6.6966
      },
      {
        "x": 2011,
        "y": 8.5082
      },
      {
        "x": 2012,
        "y": 7.3487
      },
      {
        "x": 2013,
        "y": 4.8374
      },
      {
        "x": 2014,
        "y": 4.7184
      },
      {
        "x": 2015,
        "y": 3.0337
      },
      {
        "x": 2016,
        "y": 3.9261
      },
      {
        "x": 2017,
        "y": 4.1797
      },
      {
        "x": 2018,
        "y": 5.5073
      },
      {
        "x": 2019,
        "y": 4.8949
      },
      {
        "x": 2020,
        "y": 3.5886
      }
    ]
  },
  {
    "label": "Other grains",
    "series": [
      {
        "x": 2008,
        "y": 1.5109
      },
      {
        "x": 2009,
        "y": 1.423
      },
      {
        "x": 2010,
        "y": 0.9591
      },
      {
        "x": 2011,
        "y": 1.1507
      },
      {
        "x": 2012,
        "y": 1.5834
      },
      {
        "x": 2013,
        "y": 1.7179
      },
      {
        "x": 2014,
        "y": 1.7994
      },
      {
        "x": 2015,
        "y": 1.3685
      },
      {
        "x": 2016,
        "y": 1.3255
      },
      {
        "x": 2017,
        "y": 1.5422
      },
      {
        "x": 2018,
        "y": 1.5911
      },
      {
        "x": 2019,
        "y": 1.5212
      },
      {
        "x": 2020,
        "y": 2.3102
      }
    ]
  },
  {
    "label": "Potatoes",
    "series": [
      {
        "x": 2008,
        "y": 1.9576
      },
      {
        "x": 2009,
        "y": 1.924
      },
      {
        "x": 2010,
        "y": 3.447
      },
      {
        "x": 2011,
        "y": 2.2662
      },
      {
        "x": 2012,
        "y": 2.5331
      },
      {
        "x": 2013,
        "y": 2.2751
      },
      {
        "x": 2014,
        "y": 1.7454
      },
      {
        "x": 2015,
        "y": 3.1537
      },
      {
        "x": 2016,
        "y": 1.9847
      },
      {
        "x": 2017,
        "y": 1.326
      },
      {
        "x": 2018,
        "y": 1.8943
      },
      {
        "x": 2019,
        "y": 1.7986
      },
      {
        "x": 2020,
        "y": 2.1017
      }
    ]
  },
  {
    "label": "Sorghum",
    "series": [
      {
        "x": 2008,
        "y": 1.9626
      },
      {
        "x": 2009,
        "y": 1.6995
      },
      {
        "x": 2010,
        "y": 1.5099
      },
      {
        "x": 2011,
        "y": 1.7814
      },
      {
        "x": 2012,
        "y": 2.2441
      },
      {
        "x": 2013,
        "y": 2.6557
      },
      {
        "x": 2014,
        "y": 1.8085
      },
      {
        "x": 2015,
        "y": 1.8595
      },
      {
        "x": 2016,
        "y": 2.0104
      },
      {
        "x": 2017,
        "y": 1.5809
      },
      {
        "x": 2018,
        "y": 1.6588
      },
      {
        "x": 2019,
        "y": 1.7199
      },
      {
        "x": 2020,
        "y": 1.9613
      }
    ]
  },
  {
    "label": "Oats",
    "series": [
      {
        "x": 2008,
        "y": 1.8692
      },
      {
        "x": 2009,
        "y": 2.3015
      },
      {
        "x": 2010,
        "y": 1.8451
      },
      {
        "x": 2011,
        "y": 1.6838
      },
      {
        "x": 2012,
        "y": 1.9566
      },
      {
        "x": 2013,
        "y": 1.4428
      },
      {
        "x": 2014,
        "y": 1.1173
      },
      {
        "x": 2015,
        "y": 1.0808
      },
      {
        "x": 2016,
        "y": 0.8896
      },
      {
        "x": 2017,
        "y": 1.1789
      },
      {
        "x": 2018,
        "y": 0.7562
      },
      {
        "x": 2019,
        "y": 0.8583
      },
      {
        "x": 2020,
        "y": 1.1112
      }
    ]
  },
  {
    "label": "Pulses",
    "series": [
      {
        "x": 2008,
        "y": 1.0072
      },
      {
        "x": 2009,
        "y": 1.0264
      },
      {
        "x": 2010,
        "y": 2.0517
      },
      {
        "x": 2011,
        "y": 0.9214
      },
      {
        "x": 2012,
        "y": 1.3096
      },
      {
        "x": 2013,
        "y": 0.9225
      },
      {
        "x": 2014,
        "y": 0.9672
      },
      {
        "x": 2015,
        "y": 1.7432
      },
      {
        "x": 2016,
        "y": 1.1727
      },
      {
        "x": 2017,
        "y": 1.1617
      },
      {
        "x": 2018,
        "y": 1.1144
      },
      {
        "x": 2019,
        "y": 0.6591
      },
      {
        "x": 2020,
        "y": 1.034
      }
    ]
  },
  {
    "label": "Sugarbeets",
    "series": [
      {
        "x": 2008,
        "y": 0.5289
      },
      {
        "x": 2009,
        "y": 0.4835
      },
      {
        "x": 2010,
        "y": 1.296
      },
      {
        "x": 2011,
        "y": 0.7
      },
      {
        "x": 2012,
        "y": 0.9485
      },
      {
        "x": 2013,
        "y": 0.7064
      },
      {
        "x": 2014,
        "y": 0.5729
      },
      {
        "x": 2015,
        "y": 1.5413
      },
      {
        "x": 2016,
        "y": 0.8591
      },
      {
        "x": 2017,
        "y": 0.5621
      },
      {
        "x": 2018,
        "y": 1.012
      },
      {
        "x": 2019,
        "y": 0.8517
      },
      {
        "x": 2020,
        "y": 0.9265
      }
    ]
  },
  {
    "label": "Soybeans",
    "series": [
      {
        "x": 2008,
        "y": 2.6052
      },
      {
        "x": 2009,
        "y": 1.015
      },
      {
        "x": 2010,
        "y": 8.7324
      },
      {
        "x": 2011,
        "y": 3.2287
      },
      {
        "x": 2012,
        "y": 3.5267
      },
      {
        "x": 2013,
        "y": 2.7443
      },
      {
        "x": 2014,
        "y": 1.2981
      },
      {
        "x": 2015,
        "y": 1.2237
      },
      {
        "x": 2016,
        "y": 0.6169
      },
      {
        "x": 2017,
        "y": 0.9562
      },
      {
        "x": 2018,
        "y": 0.6902
      },
      {
        "x": 2019,
        "y": 0.8821
      },
      {
        "x": 2020,
        "y": 0.7582
      }
    ]
  },
  {
    "label": "Peanuts",
    "series": [
      {
        "x": 2008,
        "y": 0.4241
      },
      {
        "x": 2009,
        "y": 0.4373
      },
      {
        "x": 2010,
        "y": 0.4444
      },
      {
        "x": 2011,
        "y": 0.4289
      },
      {
        "x": 2012,
        "y": 0.4853
      },
      {
        "x": 2013,
        "y": 0.0715
      },
      {
        "x": 2014,
        "y": 0.4518
      },
      {
        "x": 2015,
        "y": 0.3684
      },
      {
        "x": 2016,
        "y": 0.4484
      },
      {
        "x": 2017,
        "y": 0.3607
      },
      {
        "x": 2018,
        "y": 0.2803
      },
      {
        "x": 2019,
        "y": 0.3357
      },
      {
        "x": 2020,
        "y": 0.3523
      }
    ]
  },
  {
    "label": "Rye",
    "series": [
      {
        "x": 2008,
        "y": 0.1816
      },
      {
        "x": 2009,
        "y": 0.1948
      },
      {
        "x": 2010,
        "y": 0.215
      },
      {
        "x": 2011,
        "y": 0.1966
      },
      {
        "x": 2012,
        "y": 0.278
      },
      {
        "x": 2013,
        "y": 0.1871
      },
      {
        "x": 2014,
        "y": 0.2286
      },
      {
        "x": 2015,
        "y": 0.1642
      },
      {
        "x": 2016,
        "y": 0.2805
      },
      {
        "x": 2017,
        "y": 0.3199
      },
      {
        "x": 2018,
        "y": 0.1895
      },
      {
        "x": 2019,
        "y": 0.3488
      },
      {
        "x": 2020,
        "y": 0.2743
      }
    ]
  },
  {
    "label": "Millet",
    "series": [
      {
        "x": 2008,
        "y": 0.2426
      },
      {
        "x": 2009,
        "y": 0.0764
      },
      {
        "x": 2010,
        "y": 0.1883
      },
      {
        "x": 2011,
        "y": 0.1855
      },
      {
        "x": 2012,
        "y": 0.2029
      },
      {
        "x": 2013,
        "y": 0.2593
      },
      {
        "x": 2014,
        "y": 0.1153
      },
      {
        "x": 2015,
        "y": 0.1502
      },
      {
        "x": 2016,
        "y": 0.1488
      },
      {
        "x": 2017,
        "y": 0.1845
      },
      {
        "x": 2018,
        "y": 0.1652
      },
      {
        "x": 2019,
        "y": 0.1893
      },
      {
        "x": 2020,
        "y": 0.2634
      }
    ]
  },
  {
    "label": "Sunflower",
    "series": [
      {
        "x": 2008,
        "y": 0.2311
      },
      {
        "x": 2009,
        "y": 0.1877
      },
      {
        "x": 2010,
        "y": 0.2037
      },
      {
        "x": 2011,
        "y": 0.1782
      },
      {
        "x": 2012,
        "y": 0.2217
      },
      {
        "x": 2013,
        "y": 0.2434
      },
      {
        "x": 2014,
        "y": 0.2649
      },
      {
        "x": 2015,
        "y": 0.2385
      },
      {
        "x": 2016,
        "y": 0.1756
      },
      {
        "x": 2017,
        "y": 0.1763
      },
      {
        "x": 2018,
        "y": 0.2796
      },
      {
        "x": 2019,
        "y": 0.1735
      },
      {
        "x": 2020,
        "y": 0.2178
      }
    ]
  },
  {
    "label": "Rapeseed",
    "series": [
      {
        "x": 2008,
        "y": 0.0246
      },
      {
        "x": 2009,
        "y": 0.0198
      },
      {
        "x": 2010,
        "y": 0.0519
      },
      {
        "x": 2011,
        "y": 0.0297
      },
      {
        "x": 2012,
        "y": 0.0417
      },
      {
        "x": 2013,
        "y": 0.0632
      },
      {
        "x": 2014,
        "y": 0.0655
      },
      {
        "x": 2015,
        "y": 0.065
      },
      {
        "x": 2016,
        "y": 0.0366
      },
      {
        "x": 2017,
        "y": 0.0692
      },
      {
        "x": 2018,
        "y": 0.0861
      },
      {
        "x": 2019,
        "y": 0.0527
      },
      {
        "x": 2020,
        "y": 0.0501
      }
    ]
  },
  {
    "label": "Sweetpotatoes",
    "series": [
      {
        "x": 2008,
        "y": 0.0391
      },
      {
        "x": 2009,
        "y": 0.061
      },
      {
        "x": 2010,
        "y": 0.0508
      },
      {
        "x": 2011,
        "y": 0.0389
      },
      {
        "x": 2012,
        "y": 0.1573
      },
      {
        "x": 2013,
        "y": 0.0364
      },
      {
        "x": 2014,
        "y": 0.0088
      },
      {
        "x": 2015,
        "y": 0.0167
      },
      {
        "x": 2016,
        "y": 0.0134
      },
      {
        "x": 2017,
        "y": 0.0142
      },
      {
        "x": 2018,
        "y": 0.0197
      },
      {
        "x": 2019,
        "y": 0.0137
      },
      {
        "x": 2020,
        "y": 0.0102
      }
    ]
  }
];

const entertainerNotes = [
  // ===== First pass (A section) =====
  // Pickup: chromatic run D–D#–E
  { start: 0.00,  length: 0.15, note: "D4" },
  { start: 0.15,  length: 0.15, note: "D#4" },
  { start: 0.30,  length: 0.15, note: "E4" },
  // Bar 1: bouncy C5–E4–C5–E4
  { start: 0.45,  length: 0.30, note: "C5" },
  { start: 0.90,  length: 0.15, note: "E4" },
  { start: 1.05,  length: 0.30, note: "C5" },
  { start: 1.50,  length: 0.15, note: "E4" },
  // Bar 2: held C5, then pickup
  { start: 1.65,  length: 0.30, note: "C5" },
  { start: 2.40,  length: 0.15, note: "D4" },
  { start: 2.55,  length: 0.15, note: "D#4" },
  { start: 2.70,  length: 0.15, note: "E4" },
  // Bar 3: same bouncy pattern
  { start: 2.85,  length: 0.30, note: "C5" },
  { start: 3.30,  length: 0.15, note: "E4" },
  { start: 3.45,  length: 0.30, note: "C5" },
  { start: 3.90,  length: 0.15, note: "E4" },
  // Bar 4: ascending line C5–D5–E5
  { start: 4.05,  length: 0.30, note: "C5" },
  { start: 4.35,  length: 0.30, note: "D5" },
  { start: 4.65,  length: 0.30, note: "E5" },
  { start: 4.95,  length: 0.15, note: "C5" },
  { start: 5.10,  length: 0.15, note: "D5" },
  // First ending: resolve on C5
  { start: 5.25,  length: 0.50, note: "C5" },
  // ===== Second pass (repeat) =====
  // Pickup
  { start: 5.85,  length: 0.15, note: "D4" },
  { start: 6.00,  length: 0.15, note: "D#4" },
  { start: 6.15,  length: 0.15, note: "E4" },
  // Bar 1 repeat
  { start: 6.30,  length: 0.30, note: "C5" },
  { start: 6.75,  length: 0.15, note: "E4" },
  { start: 6.90,  length: 0.30, note: "C5" },
  { start: 7.35,  length: 0.15, note: "E4" },
  // Bar 2 repeat
  { start: 7.50,  length: 0.30, note: "C5" },
  { start: 8.25,  length: 0.15, note: "D4" },
  { start: 8.40,  length: 0.15, note: "D#4" },
  { start: 8.55,  length: 0.15, note: "E4" },
  // Bar 3 repeat
  { start: 8.70,  length: 0.30, note: "C5" },
  { start: 9.15,  length: 0.15, note: "E4" },
  { start: 9.30,  length: 0.30, note: "C5" },
  { start: 9.75,  length: 0.15, note: "E4" },
];

const sportData = [
  { country: 'European Union - 27 countries (from 2020)', year: '2014', value: 29.9 },
  { country: 'European Union - 27 countries (from 2020)', year: '2019', value: 32.7 },
  { country: 'European Union - 28 countries (2013-2020)', year: '2014', value: 30.8 },
  { country: 'Belgium', year: '2019', value: 29.3 },
  { country: 'Bulgaria', year: '2014', value: 9.9 },
  { country: 'Bulgaria', year: '2019', value: 11.3 },
  { country: 'Czechia', year: '2014', value: 28.4 },
  { country: 'Czechia', year: '2019', value: 25.1 },
  { country: 'Denmark', year: '2014', value: 54.6 },
  { country: 'Denmark', year: '2019', value: 55.4 },
  { country: 'Germany', year: '2014', value: 48.3 },
  { country: 'Germany', year: '2019', value: 49.0 },
  { country: 'Estonia', year: '2014', value: 23.2 },
  { country: 'Estonia', year: '2019', value: 25.8 },
  { country: 'Ireland', year: '2014', value: 29.1 },
  { country: 'Ireland', year: '2019', value: 37.3 },
  { country: 'Greece', year: '2014', value: 16.7 },
  { country: 'Greece', year: '2019', value: 19.6 },
  { country: 'Spain', year: '2014', value: 34.0 },
  { country: 'Spain', year: '2019', value: 35.4 },
  { country: 'France', year: '2014', value: 25.0 },
  { country: 'France', year: '2019', value: 27.4 },
  { country: 'Croatia', year: '2014', value: 19.4 },
  { country: 'Croatia', year: '2019', value: 19.9 },
  { country: 'Italy', year: '2014', value: 18.2 },
  { country: 'Italy', year: '2019', value: 19.7 },
  { country: 'Cyprus', year: '2014', value: 25.3 },
  { country: 'Cyprus', year: '2019', value: 22.4 },
  { country: 'Latvia', year: '2014', value: 23.3 },
  { country: 'Latvia', year: '2019', value: 20.2 },
  { country: 'Lithuania', year: '2014', value: 19.7 },
  { country: 'Lithuania', year: '2019', value: 20.9 },
  { country: 'Luxembourg', year: '2014', value: 41.6 },
  { country: 'Luxembourg', year: '2019', value: 44.9 },
  { country: 'Hungary', year: '2014', value: 28.6 },
  { country: 'Hungary', year: '2019', value: 32.3 },
  { country: 'Malta', year: '2014', value: 34.9 },
  { country: 'Malta', year: '2019', value: 12.2 },
  { country: 'Netherlands', year: '2019', value: 62.0 },
  { country: 'Austria', year: '2014', value: 50.4 },
  { country: 'Austria', year: '2019', value: 43.8 },
  { country: 'Poland', year: '2014', value: 17.1 },
  { country: 'Poland', year: '2019', value: 20.3 },
  { country: 'Portugal', year: '2014', value: 18.4 },
  { country: 'Portugal', year: '2019', value: 16.9 },
  { country: 'Romania', year: '2014', value: 8.6 },
  { country: 'Romania', year: '2019', value: 8.0 },
  { country: 'Slovenia', year: '2014', value: 37.9 },
  { country: 'Slovenia', year: '2019', value: 32.6 },
  { country: 'Slovakia', year: '2014', value: 29.4 },
  { country: 'Slovakia', year: '2019', value: 30.5 },
  { country: 'Finland', year: '2014', value: 54.6 },
  { country: 'Sweden', year: '2014', value: 54.1 },
  { country: 'Sweden', year: '2019', value: 56.4 },
  { country: 'Iceland', year: '2014', value: 60.8 },
  { country: 'Iceland', year: '2019', value: 55.9 },
  { country: 'Norway', year: '2014', value: 56.8 },
  { country: 'Norway', year: '2019', value: 67.6 },
  { country: 'United Kingdom', year: '2014', value: 36.9 },
  { country: 'Serbia', year: '2019', value: 16.8 },
  { country: 'Türkiye', year: '2014', value: 4.7 },
  { country: 'Türkiye', year: '2019', value: 5.4 },
];

</script>

My 30 Day Chart Challenge Record in 2026

Resources:
[Prompt List](https://github.com/30DayChartChallenge/Edition2026)

<Treemap
  data={treemapData}
  title="Day 1: Part-to-whole - Yarn Weights of Top 100 Patterns on Raverly on Apr 1, 2026"
  subtitle="April Knitting means still Winter time for the Northern Hemisphere, so that's likely why Medium Weight patterns are popular."
  source="Raverly API"
/>

<PictogramSlope
  data={pictogramData}
  title="Day 2: Pictogram - Annual Visits to the Toronto Public Library"
  subtitle="2 years post-pandemic, annual visits have recovered to 66% of their 2012 peak."
  source="TPL Open Data"
  width={960}
  height={640}
/>

<WaffleChart
  data={skiData}
  unit={1}
  unitLabel="resort"
  cols={20}
  title="Day 3: Mosaic - Ski Resorts Across Austria by Region"
  subtitle="Tyrol alone accounts for nearly a third of all ski resorts in Austria."
  source="Austrian Tourism Data"
/>

<SlopeChart
  data={racoonData}
  columns={['January', 'February', 'March']}
  columnLabels={['Jan 2024', 'Feb 2024', 'Mar 2024']}
  title="Day 4: Slope - Number of Green Bins Opened by Racoons"
  subtitle="What should the reader notice?"
  source="Toronto Open Data - Raccoon Activity Index"
/>


<Sonification
  data={entertainerNotes}
  title="Day 5: Experimentation — The Entertainer (First 10 Seconds)"
  subtitle="Each bar is a note — pitch on the y-axis, time on the x-axis · press play to hear the melody"
  source="Scott Joplin, 1902"
  waveform="triangle"
/>


<Pressfreedommap
  title="Day 6:Reporters Without Borders - World Press Freedom Index 2025"
  source="Reporters Without Borders (RSF)"
  width={960}
  height={560}
/>


<SmallMultipleLines
  data={irrigationData}
  labelKey="label"
  seriesKey="series"
  xKey="x"
  yKey="y"
  sortBy="endValue"
  cols={5}
  yAxisLabel="km³"
  title="Day 7: Multiscale - Continental US Irrigation water use by crop "
  subtitle="Each panel has its own y axis — note scales differ · ghost lines show all panels on a shared scale"
  source="Ruess et al. (2023), Water Resources Research"
/>

<RadialBar
  data={internetData}
  source="Ookla Speed Test"
  title="Day 8: Circular - Fixed Internet Speeds, 2024"
  width={960}
  height={640}
/>

<RidgeLineDensity
  data={raverlyPriceData}
  groupKey="group"
  valuesKey="values"
  bandwidth={1}
  patterns={['diagonal', 'crosshatch', 'stipple']}
  title="Day 9: Wealth - Raverly Pattern Price Distribution"
  subtitle="Across 600+ patterns, Clothing Items dominate both volume and price, with Shawls and Pullovers leading at up to $15.00 USD"
  source="Raverly API"
/>

<RidgeLineDensity
  data={taylorSwiftSpeechinessData}
  groupKey="group"
  valuesKey="values"
  bandwidth={0.01}
  patterns={['diagonal','crosshatch', 'stipple']}
  title="Day 10: Pop Cultue - Taylor Swift Speechiness Score up to 2024"
  subtitle="The 2010s were Taylor's most unpredictable decade, her lyrics swinging between whisper-soft country and rap-adjacent pop"
  source="Spotify API"
/>

<BarChart
  data={sportData}
  categoryKey="country"
  groupKey="year"
  valueKey="value"
  title="Day 11: Physical - Time Spent on Aerobic physical activity by European Country"
  subtitle="One third of Europeans spent at least 150 minutes per week on physical activity in 2019."
  source="eurostat"
/>

<BarChart
  data={flowingData}
  categoryKey="country"
  groupKey="president"
  valueKey="value"
  title="Day 12: Flowing Data - US allies have collapsed under Trump"
  subtitle="Top Countries by Weighted UN Vote Correlation Coefficient"
  source="Focal Data"
/>
<!-- Day 13 -->
<MediaAttentionChart/>
<!-- Day 14 -->
<Canadareciprocaltariffs />
<!-- Day 15 -->
<Dragonbabies />
<!-- Day 16 -->
<Incidentsvsaireleases />
<!-- Day 17 -->
<Labourcosteurope />