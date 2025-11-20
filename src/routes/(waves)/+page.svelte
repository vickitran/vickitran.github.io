<script lang="ts">
	import Hero from '$lib/components/organisms/Hero.svelte';
	import About from '$lib/components/organisms/About.svelte';
	import RecentPosts from '$lib/components/organisms/RecentPosts.svelte';
	import Features from '$lib/components/organisms/Features.svelte';
	import type { Feature, BlogPost } from '$lib/utils/types';

	export let data: {
		features: Feature[];
		posts: BlogPost[];
	};

	let { features, posts } = data;
</script>

<div class="hero-about-section">
	<Hero />
	<About />
</div>
{#if posts && posts.length > 0}
	<div class="container">
		<RecentPosts {posts} />
	</div>
{/if}

<!-- <Features {features} /> -->

<style>
	.hero-about-section {
		height: 100vh;
		height: 100dvh; /* Dynamic viewport height for mobile */
		display: flex;
		flex-direction: column;
	}

	.hero-about-section :global(#about) {
		flex: 1;
		display: flex;
		align-items: center;
	}
</style>
