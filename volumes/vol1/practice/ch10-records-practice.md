# Practice: a bus timetable

A timetable is a pile of records, each one the same shape, `record Service(String route, int departs, String destination) {}`. Printed, one looks like this:

```text
Service[route=47, departs=415, destination=Harbor]
```

Route, departure, destination. The departure is stored as minutes since midnight—415 is 06:55—because minutes are easy to compare and sort, and `06:55` is neither. Turning them back into a clock face is a job for the display, and one of these steps.

Everything here uses Chapters 1 to 10: records and their accessors, `Comparator.comparing`, maps and sets, `containsKey`, and the conditional expression.

The services to test with:

| Route | Departs | To |
| --- | --- | --- |
| 12 | 380 (06:20) | Museum |
| 47 | 415 (06:55) | Harbor |
| 47 | 500 (08:20) | Harbor |
| 9 | 1000 (16:40) | Airport |

Peak hours are 07:00 to 09:20 and 16:00 to 19:00—in minutes, 420 up to but not including 560, and 960 up to but not including 1140.

Each step names the method exactly: its return type, its name and its parameters. Check calls it with the cases under "What it should do," and those cases make each service with `new Service(...)` and each list with `new ArrayList<>(List.of(...))`, as in Chapter 7. Every box that works with services declares the `Service` record on its first line, since each box is a whole program: keep that line.

## Steps

**Step 1.** Write `String routeOf(Service service)`, returning the route of one service. Read all three components into variables first, with the record's accessors, so the next reader can see what a service holds.

```java
record Service(String route, int departs, String destination) {}

String routeOf(Service service) {
    String route = service.route();
    int departs = service.departs();
    String destination = service.destination();
    return route;
}

void main() {
    Service service = new Service("47", 415, "Harbor");
    IO.println(routeOf(service));
}
```

**Step 2.** Write `String clock(int minutes)`, turning minutes since midnight into an `HH:MM` string. Both halves are padded to two digits, so 380 is `06:20` and midnight is `00:00`.

```java
String clock(int minutes) {
    return String.format("%02d:%02d", minutes / 60, minutes % 60);
}

void main() {
    IO.println(clock(380));
    IO.println(clock(0));
}
```

**Step 3.** Write `ArrayList<String> destinations(ArrayList<Service> services)`, returning every destination served, in alphabetical order, with no repeats.

```java
record Service(String route, int departs, String destination) {}

ArrayList<String> destinations(ArrayList<Service> services) {
    Set<String> places = new TreeSet<>();
    for (Service service : services) {
        places.add(service.destination());
    }
    return new ArrayList<>(places);
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("12", 380, "Museum"),
            new Service("47", 415, "Harbor"),
            new Service("47", 500, "Harbor")));
    IO.println(destinations(services));
}
```

**Step 4.** Write `Service nextAfter(ArrayList<Service> services, int minute)`, returning the record of the first bus leaving *strictly after* that minute, or `null` when the day is done. A bus leaving at exactly that minute has gone. The services may come in any order.

```java
record Service(String route, int departs, String destination) {}

Service nextAfter(ArrayList<Service> services, int minute) {
    ArrayList<Service> sorted = new ArrayList<>(services);
    sorted.sort(Comparator.comparing(service -> service.departs()));
    for (Service service : sorted) {
        if (service.departs() > minute) {
            return service;
        }
    }
    return null;
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("12", 380, "Museum"),
            new Service("47", 415, "Harbor"),
            new Service("47", 500, "Harbor")));
    IO.println(nextAfter(services, 400));
    IO.println(nextAfter(services, 600));
}
```

**Step 5.** Write `ArrayList<Service> byTime(ArrayList<Service> services)`, returning the services ordered by departure. A list's `sort` takes a comparator.

```java
record Service(String route, int departs, String destination) {}

ArrayList<Service> byTime(ArrayList<Service> services) {
    ArrayList<Service> sorted = new ArrayList<>(services);
    sorted.sort(Comparator.comparing(service -> service.departs()));
    return sorted;
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("47", 500, "Harbor"),
            new Service("12", 380, "Museum"),
            new Service("47", 415, "Harbor")));
    IO.println(byTime(services));
}
```

**Step 6.** Write `Map<String, Integer> countByRoute(ArrayList<Service> services)`, returning a map of route to how many services it runs, built the way this chapter groups: put in a 0 for a route the map does not have yet, then add one to it.

```java
record Service(String route, int departs, String destination) {}

Map<String, Integer> countByRoute(ArrayList<Service> services) {
    Map<String, Integer> counts = new LinkedHashMap<>();
    for (Service service : services) {
        String route = service.route();
        if (!counts.containsKey(route)) {
            counts.put(route, 0);
        }
        counts.put(route, counts.get(route) + 1);
    }
    return counts;
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("12", 380, "Museum"),
            new Service("47", 415, "Harbor"),
            new Service("47", 500, "Harbor")));
    IO.println(countByRoute(services));
}
```

**Step 7.** Write `String label(int minute)`, returning `"peak"` or `"off-peak"` for a departure time, as a single conditional expression rather than an `if` block.

```java
String label(int minute) {
    return (minute >= 420 && minute < 560) || (minute >= 960 && minute < 1140)
            ? "peak"
            : "off-peak";
}

void main() {
    IO.println(label(415));
    IO.println(label(500));
}
```

**Step 8.** Write `ArrayList<String> timetableLines(ArrayList<Service> services)`, returning the printable timetable: one string per service reading `47 06:55 Harbor`, in departure order. Bring in your `clock` and `byTime` from steps 2 and 5, and use them.

```java
record Service(String route, int departs, String destination) {}

String clock(int minutes) {
    return String.format("%02d:%02d", minutes / 60, minutes % 60);
}

ArrayList<Service> byTime(ArrayList<Service> services) {
    ArrayList<Service> sorted = new ArrayList<>(services);
    sorted.sort(Comparator.comparing(service -> service.departs()));
    return sorted;
}

ArrayList<String> timetableLines(ArrayList<Service> services) {
    ArrayList<String> lines = new ArrayList<>();
    for (Service service : byTime(services)) {
        lines.add(service.route() + " " + clock(service.departs()) + " "
                + service.destination());
    }
    return lines;
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("47", 500, "Harbor"),
            new Service("12", 380, "Museum"),
            new Service("47", 415, "Harbor")));
    for (String line : timetableLines(services)) {
        IO.println(line);
    }
}
```
