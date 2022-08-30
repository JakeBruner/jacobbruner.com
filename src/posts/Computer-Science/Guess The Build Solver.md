---
title: Word Guesser for Hypixel Game 'Guess The Build'
date: 2022-07-31
layout: blog
excerpt: A 'cheat' for a game to help you win by guessing the correct word given hints and a player's build.
---

The goal of Hypixel Network's---a Minecraft Server---game, Guess the Build, is to, hence the name, guess the matching word to a player's build. As the timer ticks down, hints are revealed progressivly, first at the 90s mark or when a player guesses correct. The game's complete list of words totals just under 2000, including some quite esoteric ones that become hard to guess. This combined with the average player's lack of building ability can turn this fun minigame into a slog. To combat this, I used a simple regex searching function in javascript, along with the `js prototype.filter()` method to test every combination. A guess is inputted, e.g. `d_g _ou__`, and underscores are converted to periods for regex, then the search function returns true iff both the length of the guess and the regex expression match. Under these conditions it puts it into a `<li>` element. I was super glad to be using Svelte for this! Many tasks like listening for the user's input were made trivial under svelte's neat bindings and reactive statements. This combined with tailwind's 'even:' and 'odd:' directives made the ui look quite nice---if I do say so myself. It was a quick fun project!

<a href="/guess-the-build-solver">Link</a>
