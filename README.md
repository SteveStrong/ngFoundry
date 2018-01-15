# NgFoundry

Interactive 2D/3D library for designed for the collaborative construction of semantically correct diagrams and drawings.

Great visualization tools exist in open source for charting and diagraming (d3.js, three.js). ngFoundry is a programmatic approach to creating diagram with a focus on preserving the semantics of the model to be visualized. This is enforced during user interaction and programmatic queries. 

A Metadata Always approach allows for storage of design intent within executable code. Metadata can be transferred between computers in real time to synchronize the actions of multiple systems

ngFoundry is a TypeScript/Angular implementation. The library is a series of well factored JavaScript classes engineered to represent components of semantic models of real worlds systems using a common vocabulary. Components, Attributes, Relationships, Notifications and Instances are all first class objects in ngFoundry, along with the supporting knowledge structures like Concepts, Properties and Conditional Assemblies.  First class objects including Shape1D, Shape2D, Shape3D, ConnectionPoints, Glue and Collections make diagrams progrmatially explicit 

ngFoundry mashes together computer science ideas from Object Oriented, programming, Functional programming, the Actor model, and reactive programming to create it approach to modeling real world system.  



* Designed for Collaboration
  * internal events and messages implemented using Rxjs
  * external events using web sockets implemented using SignalR
  * json structures for metadata, model, and diagram sharing
* Designed for Semantic interaction and enforcement
  * extendable TypeScript classes allows for extension / substitution of modeling language
  * internal `Lifecycle` events to monitor changes and create reactive behaviors 
  * metadata first modeling with explicit `knowledge` classes to manage schema and definitions
  * dynamic model referencing syntax to locate and engage parents and sibling elements
  * computation engine to manage changes in model state and composition
* Designed for the Web and Desktop (cross-platform) 
  * rich 2D interaction system using `html canvas`
  * 3D models and interaction to visualize real world behaviors
  * Https / Rest integration to simplify connectivity to existing systems
  * build using web standards and state of the art open source projects
* async is the primary mode on communication, embrace it
* Lessons learned from previous implementations
  * the Foundry Library (originally developed in c#, Rx, Visio, Xaml)
  * a simple set of shape operations (create, destroy, connect, disconnect, set, get and change) exist in every model
  * use the system to build itself. Model first approach, using programming to promote behavior that supports assembly not drive it
  * automated testing insures quality and help you discover model weaknesses  

## Final thought

As an engineer practicing in the early days of computer programming, I was always disappointed that computer languages were created to procedurally execute instructions, and not semantically describe scenarios declaratively and optimize the outcome. I have learned that writing software is a process of primarily listening and coding toward the truth.  I believe visualization and collaboration leads to a deeper understanding of a problem and the people you are working with to build a solution.

After 40 years of writing software I understand deeply understand why this must be true, but there is still a part of me that hopes by creating language elements that let non-programmers declarative describe their domain using their own vocabulary the task of creating software can become use error prone    


# Instructions for building and running ngFoundry yourself

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.0.0.

## Development server

Run `ng serve -o` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.


## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).


#Interesting links for reference

http://nicholasjohnson.com/blog/how-angular2-di-works-with-typescript/
