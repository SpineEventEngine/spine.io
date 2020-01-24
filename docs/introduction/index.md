---
title: Documentation
headline: Documentation
bodyclass: docs
layout: docs
---
# Development Process

Building a solution based on Spine Event Engine framework is an iterative process which consists
of the stages described in this document.
 
## Getting domain knowledge

The purpose of this step is to find out what we're going to build and why.
Consider using [EventStorming](https://eventstorming.com) or other DDD-based analysis 
methodology for helping you grasp the domain knowledge from the experts.
 
Most likely that the solution would have several [Bounded Contexts](concepts.html#bounded-context). 
For each context developers need to define:
  * [Events](concepts.html#event)
  * [Commands](concepts.html#command)
  * [Rejections](concepts.html#rejection)
  * [Aggregates](concepts.html#aggregate), 
    [Process Managers](concepts.html#process-manager), and
    [Projections](concepts.html#projection).

It is likely that some of the bits of this picture would change during the process.
But the whole team, including domain experts, need to have complete understanding of how the 
business works to avoid “surprises” down the road. 

We return to learning the domain when we discover inconsistencies in the model,
or we need more information about how the business works, or the business wants to develop further
and we need to update the model.

Once we got enough domain knowledge we proceed to implementation. 

## Implementing a Bounded Context

At this stage we select one of the Bounded Contexts for the implementation.
Each context is developed separately. In this sense it can be seen as a microservice.
It would be natural to start implementing the context which initiates the business flow.

### Defining data types

Implementation starts from defining data types of the selected context as Protobuf messages.

The first step is to define entity [IDs](concepts.html#identifier). For example:
<pre class="highlight lang-proto">
<code>// The identifier for a task.
message TaskId {
    string uuid = 1;
}
</code></pre>

Then commands, events, rejections are defined:
<pre class="highlight lang-proto">
<code>// A command to create a new task.
message CreateTask {
    TaskId id = 1;
    string name = 2 [(required) = true];
    string description = 3;
}
</code></pre>

<pre class="highlight lang-proto">
<code>// A new task has been created.
message TaskCreated {
    TaskId id = 1;
    string name = 2 [(required) = true];
    string description = 3;
}
</code></pre>
 
Then we define states of entities.
<pre class="highlight lang-proto">
<code>message Task {
    (entity).kind = AGGREGATE;
    TaskId id = 1;
    string name = 2 [(required) = true];
    string description = 3;
    DeveloperId assignee = 4;
}</code></pre>
 
[Value Objects](concepts.html#value-object) are added when they are needed to describe entities
or messages like commands or events. For more information on this stage please see
the [Model Definition](/docs/guides/model-definition.html) guide.

### Adding business logic

The business logic of a Bounded Context is based on [Entities](#entities).
They handle messages updating the state in response. Entities like `Aggregate`s and
`ProcessManager`s can generate events. `ProcessManager`s can also generate new commands.
`Projection`s only consume events. 

Updating the state of the domain model in response to messages and generating new messages is
the “life” of the domain model. Messages are delivered to entities by [Repositories](#repositories).

#### Entities

During this step we create entity classes and add message handling methods to them. 
Code snippets below show `Aggregate` and `Projection` classes with handler methods.

<pre class="highlight lang-java">
<code>final class TaskAggregate
    extends Aggregate&lt;TaskId, Task, Task.Builder&gt; {
    
    @Assign
    TaskCreated handle(CreateTask cmd, CommandContext ctx) {
        return TaskCreated
                .newBuilder()
                .setId(cmd.getId())
                .setName(cmd.getName())
                .setOwner(ctx.getActor())
                .vBuild();
    }
    ...
}
</code></pre>

<pre class="highlight lang-java">
<code>final class TaskProjection
    extends Projection&lt;TaskId, TaskItem, TaskItem.Builder&gt; {

    @Subscribe
    void on(TaskCreated e) {
        builder().setId(e.getId())
                 .setName(e.getName())
    }

    @Subscribe
    void on(TaskCompleted e, EventContext ctx) {
        builder().setWhenDone(ctx.getTimestamp());
    }
}</code></pre>

#### Repositories
The framework provide default implementations for repositories.
A custom `Repository` class may be needed for:
  * <strong>Dispatching messages to entities in a non-standard way</strong>.
    By default, a command is dispatched using the first field of the command message.
    An event is dispatched by the ID of the entity which generated the event.
  * <strong>Domain-specific operations</strong> on entities of this kind.
  
Repositories are added to the Bounded Context they belong when it is created:

<pre class="highlight lang-java">
<code>BoundedContext tasksContext = BoundedContext.multiTenant("Tasks")
    .add(TaskAggregate.class) // use default repository impl.
    .add(new TaskProjectionRepository())
    .build();
</code></pre>  

This wires repositories into the message delivery mechanism of corresponding
[Buses](concepts.html#message-buses).
  
#### Testing
Implementation of the Bounded Context is tested using the messaging paradigm.
The following code snippet asserts that handling a command `CreateTask` produces one 
`TaskCreated` event with expected arguments.
 
<pre class="highlight lang-java"><code>// Given
BlackBoxBoundedContext context = BlackBoxBoundedContext.from(tasksContext);

// When
context.receivesCommand(createTask());

// Then
TaskCreated expected = TaskCreated.newBuilder()
    .setId(id)
    .setName(name)
    .build();

EventSubject assertEvents = 
    context.assertEvents()
           .withType(TaskCreated.class)    

assertEvents.hasSize(1);
assertEvents.message(0)
       .comparingExpectedFieldsOnly()
       .isEqualTo(expected);  
</code></pre>

Modification of entities is also tested. The following code snippet asserts that the state
of the `TaskAggregate` was also updated with expected arguments.

<pre class="highlight lang-java"><code>EntitySubject assertEntity = 
    context.assertEntityWithState(Task.class, id);
Task expectedState = Task.newBuilder()
    .setId(id)
    .setName(name)
    .build();
assertEntity.hasStateThat()
    .comparingExpectedFieldsOnly()
    .isEqualTo(expectedState);
</code></pre>

## Deployment

### Configuring Server Environment

### Assembling Application

The server-side application is composed with its Bounded Contexts.

<pre class="highlight lang-java"><code>Server server = Server.atPort(portNumber)
    .add(tasksContext)
    .add(usersContext)
    .add(commentsContext)
    .build();
server.start();    
</code></pre>

This exposes `CommandService`, `QueryService`, and `SubscriptionService` for client-side
connections.

## Repeating the cycle

## Client application development
 


  
