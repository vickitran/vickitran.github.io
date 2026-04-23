<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { colors, type, spacing } from '$lib/chartUtils/theme.js';
	import { createSvg, addFurniture, addA11yTable, createDataBox } from '$lib/chartUtils/utils.js';

	export let subtitle = 'Cities are better iodized — but the gap varies wildly';
	export let title = 'Day 18: UNICEF - % of households consuming iodized salt.';
	export let source = 'UNICEF Global Database on Iodized Salt, 2022 Update';
	export let width = 960;
	export let height = 1500;

	const GAP_THRESHOLD = 20;

	const RAW = [
		{
			country: 'Djibouti',
			iso: 'DJI',
			region: 'SSA',
			income: 'Lower Middle Income',
			year: 2006,
			national: 4.4,
			urban_r: 4.5,
			rural_r: 2.7,
			gap: 1.8
		},
		{
			country: 'Haiti',
			iso: 'HTI',
			region: 'LAC',
			income: 'Lower Middle Income',
			year: 2017,
			national: 7.5,
			urban_r: 8.8,
			rural_r: 6.7,
			gap: 2.2
		},
		{
			country: 'Somalia',
			iso: 'SOM',
			region: 'SSA',
			income: 'Low Income',
			year: 2009,
			national: 6.9,
			urban_r: 4.7,
			rural_r: 8.5,
			gap: -3.8
		},
		{
			country: 'Dominican Republic',
			iso: 'DOM',
			region: 'LAC',
			income: 'Upper Middle Income',
			year: 2006,
			national: 31.9,
			urban_r: 37.3,
			rural_r: 21.6,
			gap: 15.7
		},
		{
			country: 'Morocco',
			iso: 'MAR',
			region: 'MENA',
			income: 'Lower Middle Income',
			year: 2006,
			national: 43.3,
			urban_r: 53.9,
			rural_r: 23.9,
			gap: 30.0
		},
		{
			country: 'Indonesia',
			iso: 'IDN',
			region: 'EAP',
			income: 'Lower Middle Income',
			year: 2013,
			national: 91.9,
			urban_r: 94.4,
			rural_r: 24.5,
			gap: 69.9
		},
		{
			country: "Dem. People's Rep. of Korea",
			iso: 'PRK',
			region: 'EAP',
			income: 'Low Income',
			year: 2017,
			national: 37.5,
			urban_r: 44.4,
			rural_r: 26.2,
			gap: 18.2
		},
		{
			country: 'Malaysia',
			iso: 'MYS',
			region: 'EAP',
			income: 'Upper Middle Income',
			year: 2008,
			national: 28.2,
			urban_r: 27.6,
			rural_r: 29.0,
			gap: -1.4
		},
		{
			country: 'Ukraine',
			iso: 'UKR',
			region: 'ECA',
			income: 'Lower Middle Income',
			year: 2012,
			national: 35.9,
			urban_r: 37.4,
			rural_r: 31.8,
			gap: 5.6
		},
		{
			country: 'Barbados',
			iso: 'BRB',
			region: 'LAC',
			income: 'High Income',
			year: 2012,
			national: 36.8,
			urban_r: 39.1,
			rural_r: 32.8,
			gap: 6.4
		},
		{
			country: 'Sudan',
			iso: 'SDN',
			region: 'SSA',
			income: 'Low Income',
			year: 2014,
			national: 34.4,
			urban_r: 33.6,
			rural_r: 34.8,
			gap: -1.2
		},
		{
			country: 'Guinea-Bissau',
			iso: 'GNB',
			region: 'SSA',
			income: 'Low Income',
			year: 2019,
			national: 32.6,
			urban_r: 23.2,
			rural_r: 38.4,
			gap: -15.2
		},
		{
			country: 'Yemen',
			iso: 'YEM',
			region: 'MENA',
			income: 'Low Income',
			year: 2013,
			national: 48.7,
			urban_r: 70.9,
			rural_r: 38.6,
			gap: 32.3
		},
		{
			country: 'Mozambique',
			iso: 'MOZ',
			region: 'SSA',
			income: 'Low Income',
			year: 2011,
			national: 42.5,
			urban_r: 51.1,
			rural_r: 38.8,
			gap: 12.3
		},
		{
			country: 'Guyana',
			iso: 'GUY',
			region: 'LAC',
			income: 'Upper Middle Income',
			year: 2014,
			national: 42.8,
			urban_r: 43.9,
			rural_r: 42.3,
			gap: 1.6
		},
		{
			country: 'Rep. of Moldova',
			iso: 'MDA',
			region: 'ECA',
			income: 'Upper Middle Income',
			year: 2012,
			national: 58.0,
			urban_r: 76.1,
			rural_r: 47.0,
			gap: 29.1
		},
		{
			country: 'Afghanistan',
			iso: 'AFG',
			region: 'SA',
			income: 'Low Income',
			year: 2015,
			national: 56.6,
			urban_r: 81.7,
			rural_r: 47.9,
			gap: 33.8
		},
		{
			country: 'Tonga',
			iso: 'TON',
			region: 'EAP',
			income: 'Upper Middle Income',
			year: 2019,
			national: 52.9,
			urban_r: 54.6,
			rural_r: 52.4,
			gap: 2.3
		},
		{
			country: 'Vanuatu',
			iso: 'VUT',
			region: 'EAP',
			income: 'Lower Middle Income',
			year: 2013,
			national: 62.6,
			urban_r: 81.6,
			rural_r: 54.3,
			gap: 27.3
		},
		{
			country: 'Philippines',
			iso: 'PHL',
			region: 'EAP',
			income: 'Lower Middle Income',
			year: 2018,
			national: 57.0,
			urban_r: 59.0,
			rural_r: 55.5,
			gap: 3.5
		},
		{
			country: 'Senegal',
			iso: 'SEN',
			region: 'SSA',
			income: 'Lower Middle Income',
			year: 2018,
			national: 65.1,
			urban_r: 73.5,
			rural_r: 56.5,
			gap: 17.0
		},
		{
			country: 'South Sudan',
			iso: 'SSD',
			region: 'SSA',
			income: 'Low Income',
			year: 2010,
			national: 60.0,
			urban_r: 69.7,
			rural_r: 57.1,
			gap: 12.5
		},
		{
			country: 'Guinea',
			iso: 'GIN',
			region: 'SSA',
			income: 'Low Income',
			year: 2018,
			national: 52.6,
			urban_r: 42.2,
			rural_r: 58.0,
			gap: -15.9
		},
		{
			country: 'Namibia',
			iso: 'NAM',
			region: 'SSA',
			income: 'Upper Middle Income',
			year: 2013,
			national: 73.6,
			urban_r: 87.2,
			rural_r: 59.0,
			gap: 28.2
		},
		{
			country: 'Albania',
			iso: 'ALB',
			region: 'ECA',
			income: 'Upper Middle Income',
			year: 2017,
			national: 64.6,
			urban_r: 67.3,
			rural_r: 60.2,
			gap: 7.1
		},
		{
			country: 'Viet Nam',
			iso: 'VNM',
			region: 'EAP',
			income: 'Lower Middle Income',
			year: 2010,
			national: 60.9,
			urban_r: 62.0,
			rural_r: 60.4,
			gap: 1.6
		},
		{
			country: 'Gambia',
			iso: 'GMB',
			region: 'SSA',
			income: 'Low Income',
			year: 2020,
			national: 67.1,
			urban_r: 68.9,
			rural_r: 61.2,
			gap: 7.8
		},
		{
			country: 'Iraq',
			iso: 'IRQ',
			region: 'MENA',
			income: 'Upper Middle Income',
			year: 2018,
			national: 68.3,
			urban_r: 71.1,
			rural_r: 61.2,
			gap: 9.9
		},
		{
			country: 'Turks & Caicos Is.',
			iso: 'TCA',
			region: 'LAC',
			income: 'High Income',
			year: 2020,
			national: 69.7,
			urban_r: 70.2,
			rural_r: 61.6,
			gap: 8.6
		},
		{
			country: 'Trinidad and Tobago',
			iso: 'TTO',
			region: 'LAC',
			income: 'High Income',
			year: 2011,
			national: 62.6,
			urban_r: 61.9,
			rural_r: 63.7,
			gap: -1.8
		},
		{
			country: 'Ghana',
			iso: 'GHA',
			region: 'SSA',
			income: 'Lower Middle Income',
			year: 2017,
			national: 68.9,
			urban_r: 73.7,
			rural_r: 64.0,
			gap: 9.7
		},
		{
			country: 'Chad',
			iso: 'TCD',
			region: 'SSA',
			income: 'Low Income',
			year: 2019,
			national: 65.0,
			urban_r: 64.8,
			rural_r: 65.0,
			gap: -0.2
		},
		{
			country: 'Madagascar',
			iso: 'MDG',
			region: 'SSA',
			income: 'Low Income',
			year: 2009,
			national: 68.4,
			urban_r: 83.3,
			rural_r: 65.7,
			gap: 17.6
		},
		{
			country: 'Cambodia',
			iso: 'KHM',
			region: 'EAP',
			income: 'Lower Middle Income',
			year: 2014,
			national: 68.2,
			urban_r: 81.5,
			rural_r: 65.9,
			gap: 15.5
		},
		{
			country: 'Equatorial Guinea',
			iso: 'GNQ',
			region: 'SSA',
			income: 'Upper Middle Income',
			year: 2000,
			national: 57.4,
			urban_r: 44.1,
			rural_r: 68.2,
			gap: -24.0
		},
		{
			country: 'Mongolia',
			iso: 'MNG',
			region: 'EAP',
			income: 'Lower Middle Income',
			year: 2018,
			national: 75.1,
			urban_r: 77.8,
			rural_r: 69.7,
			gap: 8.1
		},
		{
			country: 'Angola',
			iso: 'AGO',
			region: 'SSA',
			income: 'Lower Middle Income',
			year: 2015,
			national: 82.4,
			urban_r: 89.1,
			rural_r: 71.2,
			gap: 17.9
		},
		{
			country: 'Türkiye',
			iso: 'TUR',
			region: 'ECA',
			income: 'Upper Middle Income',
			year: 2008,
			national: 85.3,
			urban_r: 89.9,
			rural_r: 71.5,
			gap: 18.4
		},
		{
			country: 'Bangladesh',
			iso: 'BGD',
			region: 'SA',
			income: 'Lower Middle Income',
			year: 2019,
			national: 76.0,
			urban_r: 90.5,
			rural_r: 71.9,
			gap: 18.6
		},
		{
			country: 'Kiribati',
			iso: 'KIR',
			region: 'EAP',
			income: 'Lower Middle Income',
			year: 2018,
			national: 76.9,
			urban_r: 81.6,
			rural_r: 72.6,
			gap: 9.0
		},
		{
			country: 'Central African Rep.',
			iso: 'CAF',
			region: 'SSA',
			income: 'Low Income',
			year: 2019,
			national: 76.0,
			urban_r: 78.4,
			rural_r: 74.8,
			gap: 3.6
		},
		{
			country: 'Saint Lucia',
			iso: 'LCA',
			region: 'LAC',
			income: 'Upper Middle Income',
			year: 2012,
			national: 74.7,
			urban_r: 73.4,
			rural_r: 75.0,
			gap: -1.6
		},
		{
			country: 'Botswana',
			iso: 'BWA',
			region: 'SSA',
			income: 'Upper Middle Income',
			year: 2007,
			national: 82.6,
			urban_r: 86.5,
			rural_r: 76.4,
			gap: 10.1
		},
		{
			country: 'Pakistan',
			iso: 'PAK',
			region: 'SA',
			income: 'Lower Middle Income',
			year: 2018,
			national: 79.6,
			urban_r: 84.4,
			rural_r: 76.7,
			gap: 7.7
		},
		{
			country: 'Uzbekistan',
			iso: 'UZB',
			region: 'ECA',
			income: 'Lower Middle Income',
			year: 2006,
			national: 81.5,
			urban_r: 88.4,
			rural_r: 77.4,
			gap: 11.0
		},
		{
			country: 'Malawi',
			iso: 'MWI',
			region: 'SSA',
			income: 'Low Income',
			year: 2020,
			national: 80.0,
			urban_r: 93.8,
			rural_r: 77.4,
			gap: 16.5
		},
		{
			country: "Côte d'Ivoire",
			iso: 'CIV',
			region: 'SSA',
			income: 'Lower Middle Income',
			year: 2016,
			national: 79.7,
			urban_r: 81.8,
			rural_r: 77.8,
			gap: 4.0
		},
		{
			country: 'Togo',
			iso: 'TGO',
			region: 'SSA',
			income: 'Low Income',
			year: 2017,
			national: 80.5,
			urban_r: 81.3,
			rural_r: 80.0,
			gap: 1.3
		},
		{
			country: 'Eritrea',
			iso: 'ERI',
			region: 'SSA',
			income: 'Low Income',
			year: 2010,
			national: 86.2,
			urban_r: 95.2,
			rural_r: 81.2,
			gap: 14.0
		},
		{
			country: 'Comoros',
			iso: 'COM',
			region: 'SSA',
			income: 'Lower Middle Income',
			year: 2012,
			national: 81.9,
			urban_r: 82.5,
			rural_r: 81.7,
			gap: 0.8
		},
		{
			country: 'Lesotho',
			iso: 'LSO',
			region: 'SSA',
			income: 'Lower Middle Income',
			year: 2014,
			national: 85.0,
			urban_r: 92.5,
			rural_r: 82.0,
			gap: 10.5
		},
		{
			country: 'Dem. Rep. of the Congo',
			iso: 'COD',
			region: 'SSA',
			income: 'Low Income',
			year: 2017,
			national: 84.7,
			urban_r: 88.5,
			rural_r: 82.0,
			gap: 6.5
		},
		{
			country: 'Timor-Leste',
			iso: 'TLS',
			region: 'EAP',
			income: 'Lower Middle Income',
			year: 2016,
			national: 83.5,
			urban_r: 87.9,
			rural_r: 82.1,
			gap: 5.8
		},
		{
			country: 'Sierra Leone',
			iso: 'SLE',
			region: 'SSA',
			income: 'Low Income',
			year: 2019,
			national: 82.2,
			urban_r: 82.1,
			rural_r: 82.3,
			gap: -0.2
		},
		{
			country: 'Myanmar',
			iso: 'MMR',
			region: 'EAP',
			income: 'Lower Middle Income',
			year: 2018,
			national: 85.0,
			urban_r: 89.9,
			rural_r: 83.0,
			gap: 6.9
		},
		{
			country: 'Algeria',
			iso: 'DZA',
			region: 'MENA',
			income: 'Lower Middle Income',
			year: 2019,
			national: 89.1,
			urban_r: 92.2,
			rural_r: 83.5,
			gap: 8.7
		},
		{
			country: 'Bolivia',
			iso: 'BOL',
			region: 'LAC',
			income: 'Lower Middle Income',
			year: 2016,
			national: 85.7,
			urban_r: 86.7,
			rural_r: 83.7,
			gap: 3.0
		},
		{
			country: 'Zimbabwe',
			iso: 'ZWE',
			region: 'SSA',
			income: 'Lower Middle Income',
			year: 2019,
			national: 83.8,
			urban_r: 83.4,
			rural_r: 84.0,
			gap: -0.6
		},
		{
			country: 'Sao Tome & Principe',
			iso: 'STP',
			region: 'SSA',
			income: 'Lower Middle Income',
			year: 2019,
			national: 88.6,
			urban_r: 90.5,
			rural_r: 84.8,
			gap: 5.7
		},
		{
			country: 'Guatemala',
			iso: 'GTM',
			region: 'LAC',
			income: 'Upper Middle Income',
			year: 2009,
			national: 88.2,
			urban_r: 92.1,
			rural_r: 84.8,
			gap: 7.3
		},
		{
			country: 'Cuba',
			iso: 'CUB',
			region: 'LAC',
			income: 'Upper Middle Income',
			year: 2019,
			national: 89.9,
			urban_r: 92.9,
			rural_r: 85.0,
			gap: 7.9
		},
		{
			country: 'Ethiopia',
			iso: 'ETH',
			region: 'SSA',
			income: 'Low Income',
			year: 2016,
			national: 85.6,
			urban_r: 86.3,
			rural_r: 85.4,
			gap: 0.9
		},
		{
			country: 'Zambia',
			iso: 'ZMB',
			region: 'SSA',
			income: 'Low Income',
			year: 2013,
			national: 88.4,
			urban_r: 91.9,
			rural_r: 85.9,
			gap: 6.0
		},
		{
			country: 'Benin',
			iso: 'BEN',
			region: 'SSA',
			income: 'Lower Middle Income',
			year: 2018,
			national: 84.7,
			urban_r: 82.8,
			rural_r: 86.2,
			gap: -3.5
		},
		{
			country: 'Tuvalu',
			iso: 'TUV',
			region: 'EAP',
			income: 'Upper Middle Income',
			year: 2019,
			national: 85.4,
			urban_r: 84.5,
			rural_r: 86.4,
			gap: -1.9
		},
		{
			country: 'Solomon Islands',
			iso: 'SLB',
			region: 'EAP',
			income: 'Lower Middle Income',
			year: 2015,
			national: 88.4,
			urban_r: 94.1,
			rural_r: 87.3,
			gap: 6.9
		},
		{
			country: 'Thailand',
			iso: 'THA',
			region: 'EAP',
			income: 'Upper Middle Income',
			year: 2019,
			national: 84.1,
			urban_r: 80.6,
			rural_r: 87.3,
			gap: -6.7
		},
		{
			country: 'Belize',
			iso: 'BLZ',
			region: 'LAC',
			income: 'Upper Middle Income',
			year: 2015,
			national: 84.9,
			urban_r: 81.9,
			rural_r: 87.5,
			gap: -5.6
		},
		{
			country: 'Congo',
			iso: 'COG',
			region: 'SSA',
			income: 'Lower Middle Income',
			year: 2014,
			national: 91.1,
			urban_r: 92.9,
			rural_r: 87.6,
			gap: 5.4
		},
		{
			country: 'Honduras',
			iso: 'HND',
			region: 'LAC',
			income: 'Lower Middle Income',
			year: 2019,
			national: 88.3,
			urban_r: 88.9,
			rural_r: 87.8,
			gap: 1.1
		},
		{
			country: 'Peru',
			iso: 'PER',
			region: 'LAC',
			income: 'Upper Middle Income',
			year: 2020,
			national: 91.4,
			urban_r: 92.5,
			rural_r: 88.2,
			gap: 4.3
		},
		{
			country: 'Eswatini',
			iso: 'SWZ',
			region: 'SSA',
			income: 'Lower Middle Income',
			year: 2014,
			national: 90.4,
			urban_r: 92.7,
			rural_r: 89.0,
			gap: 3.7
		},
		{
			country: 'Tajikistan',
			iso: 'TJK',
			region: 'ECA',
			income: 'Lower Middle Income',
			year: 2017,
			national: 91.4,
			urban_r: 95.1,
			rural_r: 89.7,
			gap: 5.4
		},
		{
			country: 'Burundi',
			iso: 'BDI',
			region: 'SSA',
			income: 'Low Income',
			year: 2016,
			national: 89.4,
			urban_r: 86.2,
			rural_r: 89.8,
			gap: -3.6
		},
		{
			country: 'Liberia',
			iso: 'LBR',
			region: 'SSA',
			income: 'Low Income',
			year: 2019,
			national: 86.6,
			urban_r: 83.8,
			rural_r: 90.2,
			gap: -6.4
		},
		{
			country: 'Rwanda',
			iso: 'RWA',
			region: 'SSA',
			income: 'Low Income',
			year: 2015,
			national: 90.5,
			urban_r: 90.5,
			rural_r: 90.5,
			gap: 0.0
		},
		{
			country: 'Paraguay',
			iso: 'PRY',
			region: 'LAC',
			income: 'Upper Middle Income',
			year: 2019,
			national: 91.8,
			urban_r: 93.4,
			rural_r: 90.6,
			gap: 2.8
		},
		{
			country: 'Kazakhstan',
			iso: 'KAZ',
			region: 'ECA',
			income: 'Upper Middle Income',
			year: 2015,
			national: 94.4,
			urban_r: 96.8,
			rural_r: 90.7,
			gap: 6.1
		},
		{
			country: 'Cameroon',
			iso: 'CMR',
			region: 'SSA',
			income: 'Lower Middle Income',
			year: 2018,
			national: 90.7,
			urban_r: 90.4,
			rural_r: 91.0,
			gap: -0.6
		},
		{
			country: 'South Africa',
			iso: 'ZAF',
			region: 'SSA',
			income: 'Upper Middle Income',
			year: 2016,
			national: 91.1,
			urban_r: 91.1,
			rural_r: 91.2,
			gap: 0.0
		},
		{
			country: 'Uganda',
			iso: 'UGA',
			region: 'SSA',
			income: 'Low Income',
			year: 2016,
			national: 91.3,
			urban_r: 91.0,
			rural_r: 91.4,
			gap: -0.3
		},
		{
			country: 'Nigeria',
			iso: 'NGA',
			region: 'SSA',
			income: 'Lower Middle Income',
			year: 2018,
			national: 93.3,
			urban_r: 95.3,
			rural_r: 91.5,
			gap: 3.8
		},
		{
			country: 'Lao PDR',
			iso: 'LAO',
			region: 'EAP',
			income: 'Lower Middle Income',
			year: 2017,
			national: 93.6,
			urban_r: 95.7,
			rural_r: 92.5,
			gap: 3.2
		},
		{
			country: 'Azerbaijan',
			iso: 'AZE',
			region: 'ECA',
			income: 'Upper Middle Income',
			year: 2013,
			national: 93.4,
			urban_r: 94.3,
			rural_r: 92.5,
			gap: 1.9
		},
		{
			country: 'Iran',
			iso: 'IRN',
			region: 'MENA',
			income: 'Lower Middle Income',
			year: 2000,
			national: 93.5,
			urban_r: 95.2,
			rural_r: 92.5,
			gap: 2.7
		},
		{
			country: 'Gabon',
			iso: 'GAB',
			region: 'SSA',
			income: 'Upper Middle Income',
			year: 2012,
			national: 89.5,
			urban_r: 88.8,
			rural_r: 92.6,
			gap: -3.8
		},
		{
			country: 'India',
			iso: 'IND',
			region: 'SA',
			income: 'Lower Middle Income',
			year: 2020,
			national: 93.9,
			urban_r: 96.4,
			rural_r: 92.6,
			gap: 3.8
		},
		{
			country: 'Kenya',
			iso: 'KEN',
			region: 'SSA',
			income: 'Lower Middle Income',
			year: 2014,
			national: 94.6,
			urban_r: 95.0,
			rural_r: 94.4,
			gap: 0.6
		},
		{
			country: 'Nepal',
			iso: 'NPL',
			region: 'SA',
			income: 'Lower Middle Income',
			year: 2016,
			national: 95.2,
			urban_r: 98.3,
			rural_r: 94.7,
			gap: 3.6
		},
		{
			country: 'Samoa',
			iso: 'WSM',
			region: 'EAP',
			income: 'Lower Middle Income',
			year: 2019,
			national: 95.9,
			urban_r: 97.0,
			rural_r: 95.7,
			gap: 1.3
		},
		{
			country: 'Brazil',
			iso: 'BRA',
			region: 'LAC',
			income: 'Upper Middle Income',
			year: 2007,
			national: 98.4,
			urban_r: 98.9,
			rural_r: 95.9,
			gap: 3.0
		},
		{
			country: 'State of Palestine',
			iso: 'PSE',
			region: 'MENA',
			income: 'Lower Middle Income',
			year: 2020,
			national: 95.7,
			urban_r: 95.2,
			rural_r: 96.8,
			gap: -1.6
		},
		{
			country: 'Georgia',
			iso: 'GEO',
			region: 'ECA',
			income: 'Upper Middle Income',
			year: 2009,
			national: 98.1,
			urban_r: 98.0,
			rural_r: 98.2,
			gap: -0.2
		},
		{
			country: 'Kyrgyzstan',
			iso: 'KGZ',
			region: 'ECA',
			income: 'Lower Middle Income',
			year: 2018,
			national: 98.7,
			urban_r: 98.6,
			rural_r: 98.8,
			gap: -0.3
		},
		{
			country: 'Armenia',
			iso: 'ARM',
			region: 'ECA',
			income: 'Upper Middle Income',
			year: 2016,
			national: 99.4,
			urban_r: 99.3,
			rural_r: 99.6,
			gap: -0.3
		},
		{
			country: 'Turkmenistan',
			iso: 'TKM',
			region: 'ECA',
			income: 'Upper Middle Income',
			year: 2015,
			national: 99.7,
			urban_r: 99.7,
			rural_r: 99.8,
			gap: -0.1
		}
	];

	let container;

	onMount(() => {
		draw();
	});

	function draw() {
		if (!container) return;
		d3.select(container).selectAll('*').remove();

		const data = RAW; // already sorted by rural_r ascending

		// ── Layout ──────────────────────────────────────────────
		const TITLE_H = 192;
		const FOOTER_H = 32;
		const L = 156; // wide left margin for country labels
		const R = spacing.marginDefault.right;
		const T = TITLE_H;
		const B = spacing.marginDefault.bottom + FOOTER_H;
		const chartW = width - L - R;
		const chartH = height - T - B;

		const ROW_H = chartH / data.length;
		const DOT_R = Math.max(2.5, Math.min(4, ROW_H * 0.38));

		// ── Scales ───────────────────────────────────────────────
		const x = d3.scaleLinear().domain([0, 100]).range([0, chartW]);
		const y = d3
			.scaleBand()
			.domain(data.map((d) => d.iso))
			.range([0, chartH])
			.padding(0.15);

		// ── SVG root ─────────────────────────────────────────────
		const svg = createSvg(container, {
			width,
			height,
			ariaLabel: 'Urban vs rural iodized salt coverage by country — dot strip chart'
		});

		addFurniture(svg, { width, height, title, subtitle, source });

		// ── Databox ───────────────────────────────────────────────
		const box = createDataBox(svg, {
			width,
			fields: [
				{ key: 'country', label: 'COUNTRY' },
				{ key: 'year', label: 'SURVEY YEAR' },
				{ key: 'urban', label: 'URBAN' },
				{ key: 'rural', label: 'RURAL' },
				{ key: 'gap', label: 'URBAN − RURAL GAP' }
			],
			y: 100,
			prompt: 'Tap a country to see details'
		});

		box.btnG.on('click', () => box.clear());

		// ── Chart group ───────────────────────────────────────────
		const g = svg.append('g').attr('transform', `translate(${L}, ${T})`);

		// Grid lines (vertical at 0, 25, 50, 75, 100)
		const xTicks = [0, 25, 50, 75, 100];
		g.selectAll('.vl-grid')
			.data(xTicks)
			.join('line')
			.attr('class', 'vl-grid')
			.attr('x1', (d) => x(d))
			.attr('x2', (d) => x(d))
			.attr('y1', 0)
			.attr('y2', chartH)
			.attr('stroke', colors.gridLine)
			.attr('stroke-width', spacing.gridWidth);

		// X axis (top + bottom)
		const xAxisFn = d3
			.axisBottom(x)
			.tickValues(xTicks)
			.tickSize(0)
			.tickPadding(spacing.labelPad)
			.tickFormat((v) => `${v}%`);

		g.append('g')
			.attr('transform', `translate(0, ${chartH})`)
			.call(xAxisFn)
			.call((ax) => ax.select('.domain').remove())
			.selectAll('text')
			.style('font-family', type.sans)
			.style('font-size', `${type.axisLabel}px`)
			.style('fill', colors.warmGray);

		g.append('g')
			.attr('transform', `translate(0, 0)`)
			.call(
				d3
					.axisTop(x)
					.tickValues(xTicks)
					.tickSize(0)
					.tickPadding(6)
					.tickFormat((v) => `${v}%`)
			)
			.call((ax) => ax.select('.domain').remove())
			.selectAll('text')
			.style('font-family', type.sans)
			.style('font-size', `${type.axisLabel}px`)
			.style('fill', colors.warmGray);

		// ── Rows ─────────────────────────────────────────────────
		const rows = g
			.selectAll('.vl-row')
			.data(data)
			.join('g')
			.attr('class', 'vl-row')
			.attr('transform', (d) => `translate(0, ${y(d.iso) + y.bandwidth() / 2})`);

		const bigGap = (d) => Math.abs(d.gap) >= GAP_THRESHOLD;

		// Connecting line (drawn first, behind dots)
		rows
			.append('line')
			.attr('x1', (d) => x(Math.min(d.urban_r, d.rural_r)))
			.attr('x2', (d) => x(Math.max(d.urban_r, d.rural_r)))
			.attr('y1', 0)
			.attr('y2', 0)
			.attr('stroke', (d) => (bigGap(d) ? colors.roseMid : colors.gridLine))
			.attr('stroke-width', (d) => (bigGap(d) ? 1.5 : 1))
			.attr('opacity', 0.85);

		// Rural dot (amber)
		const ruralDots = rows
			.append('circle')
			.attr('cx', (d) => x(d.rural_r))
			.attr('cy', 0)
			.attr('r', DOT_R)
			.attr('fill', (d) => (bigGap(d) ? colors.amber : colors.sageMid))
			.attr('stroke', (d) => (bigGap(d) ? colors.amber : 'none'))
			.attr('stroke-width', 0)
			.attr('opacity', 0.9)
			.style('cursor', 'pointer');

		// Urban dot (sageDark)
		const urbanDots = rows
			.append('circle')
			.attr('cx', (d) => x(d.urban_r))
			.attr('cy', 0)
			.attr('r', DOT_R)
			.attr('fill', (d) => (bigGap(d) ? colors.sageDark : colors.sageDark))
			.attr('opacity', 0.9)
			.style('cursor', 'pointer');

		// Country labels (left)
		rows
			.append('text')
			.attr('x', -spacing.labelPad)
			.attr('y', 0)
			.attr('dy', '0.35em')
			.attr('text-anchor', 'end')
			.style('font-family', type.sans)
			.style('font-size', `${Math.max(9, Math.min(11, ROW_H * 0.72))}px`)
			.style('fill', (d) => (bigGap(d) ? colors.ink : colors.warmGray))
			.style('font-weight', (d) => (bigGap(d) ? type.medium : type.regular))
			.text((d) => d.country);

		// ── Interaction ───────────────────────────────────────────
		function handleClick(event, d) {
			const gapStr =
				d.gap >= 0
					? `+${d.gap.toFixed(1)} pp (urban ahead)`
					: `${d.gap.toFixed(1)} pp (rural ahead)`;

			box.show(
				{
					country: d.country,
					year: d.year,
					urban: `${d.urban_r.toFixed(1)}%`,
					rural: `${d.rural_r.toFixed(1)}%`,
					gap: gapStr
				},
				d.gap >= 0 ? colors.sageDark : colors.amber
			);

			// Dim all rows, highlight selected
			rows.selectAll('circle').attr('opacity', 0.18);
			rows.selectAll('line').attr('opacity', 0.12);
			rows.selectAll('text').style('fill', colors.gridLine);

			const sel = d3.select(event.currentTarget.parentNode);
			sel.selectAll('circle').attr('opacity', 1);
			sel.selectAll('line').attr('opacity', 1);
			sel
				.select('text')
				.style('fill', d.gap >= 0 ? colors.sageDark : colors.amber)
				.style('font-weight', type.medium);
		}

		function resetHighlight() {
			rows.selectAll('circle').attr('opacity', 0.9);
			rows.selectAll('line').attr('opacity', 0.85);
			rows
				.selectAll('text')
				.style('fill', (d) => (bigGap(d) ? colors.ink : colors.warmGray))
				.style('font-weight', (d) => (bigGap(d) ? type.medium : type.regular));
		}

		box.btnG.on('click', () => {
			box.clear();
			resetHighlight();
		});

		ruralDots.on('click', handleClick);
		urbanDots.on('click', handleClick);
		rows.on('click', handleClick);

		// ── Legend (SVG root, between subtitle and databox) ──────
		const DOT_R_LEG = 4;
		const LI = 110;
		const leg = svg.append('g').attr('transform', `translate(${spacing.marginDefault.left}, 58)`);

		// Urban
		leg
			.append('circle')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', DOT_R_LEG)
			.attr('fill', colors.sageDark);
		leg
			.append('text')
			.attr('x', DOT_R_LEG + 6)
			.attr('y', 0)
			.attr('dy', '0.35em')
			.style('font-family', type.sans)
			.style('font-size', '11px')
			.style('fill', colors.ink)
			.text('Urban');

		// Rural, small gap
		leg
			.append('circle')
			.attr('cx', LI)
			.attr('cy', 0)
			.attr('r', DOT_R_LEG)
			.attr('fill', colors.sageMid);
		leg
			.append('text')
			.attr('x', LI + DOT_R_LEG + 6)
			.attr('y', 0)
			.attr('dy', '0.35em')
			.style('font-family', type.sans)
			.style('font-size', '11px')
			.style('fill', colors.ink)
			.text('Rural');

		// Rural, big gap (amber)
		leg
			.append('circle')
			.attr('cx', LI * 2)
			.attr('cy', 0)
			.attr('r', DOT_R_LEG)
			.attr('fill', colors.amber);
		leg
			.append('text')
			.attr('x', LI * 2 + DOT_R_LEG + 6)
			.attr('y', 0)
			.attr('dy', '0.35em')
			.style('font-family', type.sans)
			.style('font-size', '11px')
			.style('fill', colors.ink)
			.text('Rural (>20 pp gap)');

		// Gap connector line swatch
		leg
			.append('line')
			.attr('x1', LI * 3 + 10)
			.attr('x2', LI * 3 + 26)
			.attr('y1', 0)
			.attr('y2', 0)
			.attr('stroke', colors.roseMid)
			.attr('stroke-width', 1.5);
		leg
			.append('text')
			.attr('x', LI * 3 + 30)
			.attr('y', 0)
			.attr('dy', '0.35em')
			.style('font-family', type.sans)
			.style('font-size', '11px')
			.style('fill', colors.ink)
			.text('Gap >20 pp');

		// ── Accessibility table ───────────────────────────────────
		addA11yTable(svg.node(), {
			caption: `${title} — data table`,
			columns: [
				{ key: 'country', label: 'Country' },
				{ key: 'region', label: 'Region' },
				{ key: 'year', label: 'Survey Year' },
				{ key: 'urban', label: 'Urban (%)' },
				{ key: 'rural', label: 'Rural (%)' },
				{ key: 'gap', label: 'Gap (pp)' }
			],
			rows: data.map((d) => ({
				country: d.country,
				region: d.region,
				year: d.year,
				urban: d.urban_r.toFixed(1),
				rural: d.rural_r.toFixed(1),
				gap: d.gap.toFixed(1)
			}))
		});
	}
</script>

<div bind:this={container} style="position: relative; width: 100%; margin: 2rem 0;" />
