## Components

Components are the core of mutator, all elements that you would like to be interactable via the mutator framework must be attached to one or more components. From there is where the magic happens!

Components have events that are on them, and when an event occurs related to the element it is attached to the component's event also gets triggered.

There are many events that are triggered on a compononent, and some are only avalible when attached to a specific component. For example the `check` event is only avalible when your component extends `checkbox`.

## Core Component Events

These events come standard on all components, so if you just extend `component`, you will get access to the following event:

### `ajax(data: any)`

ajax is called when some sort of ajax occurs and the data is then made avalible to the component

### `created(mutation: MutationRecord)`

created is called when the component is created. If the component is not associated with an element, then a `div` element will be created and will be associated to the component. The div will not be automatically added to the dom however.

### `modified(oldValue: any, newValue: any, attr: any, mutation: MutationRecord)`

modified is called when the componet's attributes are modified.

### `deleted(mutation: MutationRecord)`

deleted is called when the element gets deleted.

### `childrenAdded(children: NodeList)`

childrenAdded is called when children are added to the element.

### `childrenRemoved(children: NodeList)`

childrenRemoved is called when children are removed from the element.

### `tick(): number | void`

tick is called after the element gets created. If the method returns a number then tick will be called again in that many milliseconds. If tick doesn't return anything, then it will not be called again. tick is unique to the current component, so every instance that is created it will have its very own tick.

**Note:** If only one tick is needed per component type use `static tick`

### `static tick(): number | void`

tick (when called statically) is only created and called once for that component type. For example if you have two components `a` and `b` and each have a `static tick` no matter how many instances of either are created, only two ticks will be executed unlike the `non-static tick`.

## Dom Component Events

`dom` inherits `component`

Dom events are only events that occur when interacting wit the dom.

### `click()`

click is called when clicking on the element that the component is attached to. By default it will `preventDefault()`.

### `doubleClick()`

doubleClick is called when double clicking on the element that the component is attached to.

## Form Component Events

`form` inherits `dom`

## Button Component Events

`button` inherits `form`

Each button can only have an `accpet` or a `reject`, it cannot have both. You may however, have as many buttons as you want each with an `accept` or a `reject`.

### `accept()`

accept is called when the user clicks on the accpept button.

### `reject()`

reject is called when the user clicks on the reject button. If the button already has an accpet attached to it, you cannot also attach a reject to it.

## Input Component Events

`input` inherits `form`

Unlike the button, inputs can have both an `accept` and a `reject` event attached to them.

### `accept()`

accept is called when the user presses the `Enter` key on the keyboard.

### `reject()`

reject is called when the user presses the `Esc` key on the keyboard.
