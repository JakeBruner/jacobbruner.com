<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  onMount(() => {
    console.log('placeholder')
    goto('/');
  });
</script>