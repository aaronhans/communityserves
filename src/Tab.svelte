<script>
	import { getContext } from 'svelte';
	import { TABS } from './Tabs.svelte';

	const tab = {};
	const { registerTab, selectTab, selectedTab } = getContext(TABS);

	registerTab(tab);

</script>

<style type="text/scss">
	button {
		background: none;
		border: none;
		border-bottom: 2px solid white;
		border-radius: 0;
		margin: 0;
		outline: none;
	}
	
	.selected {
		border-bottom: 2px solid;
		color: #333;
	}

	:global(.cleanup.selected) {
        border-bottom: 2px solid #6209F2;
	}

	:global(.art.selected) {
        border-bottom: 2px solid #9C08B5;
	}
</style>

<button class:selected="{$selectedTab === tab}"  class={$$props.class} on:click="{() => selectTab(tab)}">
	<slot></slot>
</button>