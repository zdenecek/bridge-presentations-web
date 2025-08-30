# Development docs

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run dev
```

### Compiles and minifies for production

```
npm run build
```

## Architecture

A simple description of the project architecture follows.

Components:

- `bridge` - logic for the game of bridge
- `presenter` - render cards, scores, and other game elements
- `presentations` - tie everything together

### the `bridge` package

Logic for the game of bridge. Exposes a lot of "events" that can be listened to.

Classes of interest:

- [`Game`](src/bridge/model/Game.ts)
  Models the game of bridge. Contains players, hands, and scores.
- [`PresentationGame`](src/bridge/model/PresentationGame.ts)
  Extends `Game` and adds events to listen to.
- [`GameFactory`](src/bridge/factory/GameFactory.ts)
  Factory for creating games.
- [`PlayerFactory`](src/bridge/factory/PlayerFactory.ts)
  Factory for creating players.
- [`PresentationPlayer`](src/bridge/model/PresentationPlayer.ts)
  Extends `Player` and adds events to listen to. (e.g on card play)

### the `presenter` package

Renders the game of bridge. Contains a lot of components that can be used to render the game.

Classes of interest:

- [`View`](src/presenter/View.ts)
  Base class for all views. Represent a html element.
- [`GameViewFactory`](src/presenter/GameViewFactory.ts)
  Factory for creating all the HTML elements for the game.
  Probably a class that does too much.

The `presenter` does not use any framework, it is just a collection of classes that render the game of bridge into HTML. The View classes are used to create the HTML elements and add a little bit of logic to them.

### the `presentations` package

Ties everything together. Contains the main class that is used to create a presentation.

Uses the [Vue.js](https://vuejs.org/) framework.

Three components:

- [`Configurator`](src/presentations/components/Configurator.vue)
  Component for setting up the presentation.
- [`Presenter`](src/presentations/components/Presentation.vue)
  Component for displaying the presentation. Wraps around the `presenter`
- [`App`](src/presentations/App.vue)
  Main component that ties everything together.
