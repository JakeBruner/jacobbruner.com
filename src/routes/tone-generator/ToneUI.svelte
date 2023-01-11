<script lang="ts">
  import { SpeakerWave, SpeakerXMark } from "svelte-heros-v2";
  import Waveform from "./Waveform.svelte";
</script>

<div
  class="p-4 w-full h-22 dark:bg-zinc-750 shadow-lg rounded-[10px] flex flex-row items-center align-middle"
>
  <!-- volume slider -->
  <SpeakerWave variation="solid" class="h-4 w-4 mr-2" />
  <div class="w-24 border-2 border-zinc-500 rounded-sm h-5 relative z-10">
    <!-- TODO make the width vary with screen width -->
    <span style:width="50%" class="bg-zinc-900 h-[1.04rem] absolute -z-10 left-0" />
  </div>

  <div class="px-4" />

  <!-- waveform canvas -->
  <Waveform />
</div>
