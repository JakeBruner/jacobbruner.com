<script lang="ts">
  import { generateOptions, type GenerateOptions } from "$lib/tonegen/generate";

  import c from "$lib/c";

  // create a new array

  export let selected: GenerateOptions[number] = { name: "Random", notes: "???" };

  let query = selected.name;

  let boundingBox: HTMLDivElement;

  $: filteredOptions =
    query === ""
      ? generateOptions
      : generateOptions.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()));

  let active = false;

  let clickHandler = (e: MouseEvent) => {
    if (e.target instanceof Node && !boundingBox.contains(e.target)) {
      active = false;
    }
  };

  $: if (!active) {
    query = selected.name;
  }
</script>

<svelte:window on:click={clickHandler} />

<div class="max-w-2xs" bind:this={boundingBox}>
  <label for="combobox" class="block text-sm font-medium leading-6 text-zinc-900">Assigned to</label
  >
  <div class="relative mt-2">
    <input
      id="combobox"
      type="text"
      class="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-12 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
      role="combobox"
      aria-controls="options"
      aria-expanded={active}
      bind:value={query}
      on:click={() => {
        active = !active;
        query = "";
      }}
    />
    <button
      type="button"
      class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
    >
      <svg class="h-5 w-5 text-zinc-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fill-rule="evenodd"
          d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
    {#if active}
      <ul
        class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        id="options"
        role="listbox"
      >
        {#each filteredOptions as option, i}
          {@const isSelected = option.name === selected.name}

          <li
            class="relative cursor-default select-none py-2 pl-3 pr-9 group hover:text-white hover:bg-cyan-600 text-zinc-900"
            id={option.name}
            role="option"
            aria-selected={isSelected ? "true" : "false"}
            tabindex="-1"
            on:click={() => {
              selected = option;
              active = false;
              query = "";
            }}
            on:keypress={() => {
              selected = option;
              active = false;
              query = "";
            }}
          >
            <div class="flex">
              <span class={c("truncate", isSelected && "font-semibold")}>{option.name}</span>

              <span
                class={c(
                  "ml-2 truncate font-light text-zinc-500 group-hover:text-cyan-200",
                  isSelected && "font-normal"
                )}>{option.notes}</span
              >
            </div>

            {#if isSelected}
              <span class="absolute inset-y-0 right-0 flex items-center pr-4 text-cyan-600">
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fill-rule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
