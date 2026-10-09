# Session control: /reset, /reload, reruns, help (J2), what is not offered (U1), /exit (DERIVATION.md C8 to C12, L1, L2).
int x = 10

x + 1

int dbl(int n) {
    return n * 2;
}

import java.util.function.*;

class P { int a; }

System.out.println("hello")

int bad = "s";

int gone = 1

# A drop typed by a prefix is replayed under its full name (L1).
/dr gone

int x = 20

/reload

/list

#! startup
/list -all

/vars

/reload -quiet

100 + 1

/reload -restore

/reload -bogus

/reload foo

/history

/reset

/vars

#! startup
/list -all

x

5 + 5

/reset foo

/reset -quiet

/reload

/reload -restore

/vars

dbl(4)

/!

/-1

/1

/set feedback concise

/reset

/reload

/set feedback normal

/env

#= "|  This is the course's Java scratchpad. Type a piece of Java and press Enter to run it.\n|  A line that is not finished (an open brace, for example) waits for the next line.\n|  These commands work here:\n|  /list [<name or id>|-all|-start]\n|  \tshow the snippets you have entered, with their ids\n|  /vars [<name or id>|-all|-start]\n|  \tshow your variables and their values\n|  /methods [<name or id>|-all|-start]\n|  \tshow your methods\n|  /types [<name or id>|-all|-start]\n|  \tshow your classes, interfaces, enums and records\n|  /imports\n|  \tshow the imports in effect\n|  /drop <name or id>\n|  \tremove a snippet, by its name or its id\n|  /history\n|  \tshow every line you have typed\n|  /reset\n|  \tstart over: forget every snippet\n|  /reload [-restore] [-quiet]\n|  \tstart over, then run your snippets again; -restore runs the ones from before the last /reset or /reload\n|  /set feedback [concise|normal|silent|verbose]\n|  \tchoose how much the scratchpad says after each entry\n|  /! or /<id> or /-<n>\n|  \trun the last snippet, the snippet with that id, or the nth one back, again\n|  /help [<command>|intro]\n|  \tshow this help, or the help for one command\n|  /exit\n|  \tend this session\n|  \n|  The JDK's own jshell also has /edit, /open, /save, /env, /debug and more of /set;\n|  the scratchpad leaves them out: it runs in your browser, with no files or editor of its own.\n"
/help

#= "|  This is the course's Java scratchpad. Type a piece of Java and press Enter to run it.\n|  A line that is not finished (an open brace, for example) waits for the next line.\n|  These commands work here:\n|  /list [<name or id>|-all|-start]\n|  \tshow the snippets you have entered, with their ids\n|  /vars [<name or id>|-all|-start]\n|  \tshow your variables and their values\n|  /methods [<name or id>|-all|-start]\n|  \tshow your methods\n|  /types [<name or id>|-all|-start]\n|  \tshow your classes, interfaces, enums and records\n|  /imports\n|  \tshow the imports in effect\n|  /drop <name or id>\n|  \tremove a snippet, by its name or its id\n|  /history\n|  \tshow every line you have typed\n|  /reset\n|  \tstart over: forget every snippet\n|  /reload [-restore] [-quiet]\n|  \tstart over, then run your snippets again; -restore runs the ones from before the last /reset or /reload\n|  /set feedback [concise|normal|silent|verbose]\n|  \tchoose how much the scratchpad says after each entry\n|  /! or /<id> or /-<n>\n|  \trun the last snippet, the snippet with that id, or the nth one back, again\n|  /help [<command>|intro]\n|  \tshow this help, or the help for one command\n|  /exit\n|  \tend this session\n|  \n|  The JDK's own jshell also has /edit, /open, /save, /env, /debug and more of /set;\n|  the scratchpad leaves them out: it runs in your browser, with no files or editor of its own.\n"
/?

#= "|  \n|  The scratchpad runs Java one piece at a time: an expression shows its value,\n|  a declaration makes a variable, method or class you can use in the next entries.\n|  Try 2 + 3, then int x = 10, then x * 2. Type /help to see the commands.\n"
/help intro

#= "|  /list [<name or id>|-all|-start]\n|  \tshow the snippets you have entered, with their ids\n"
/help list

#= "|  /drop <name or id>\n|  \tremove a snippet, by its name or its id\n"
/help /drop

#= "|  /reload [-restore] [-quiet]\n|  \tstart over, then run your snippets again; -restore runs the ones from before the last /reset or /reload\n"
/help reload

#= "|  The scratchpad has no help on nosuch. Type /help to see what it offers.\n"
/help nosuch

#= "|  /edit is not available in this scratchpad. Type /help to see what is.\n"
/edit 1

#= "|  /open is not available in this scratchpad. Type /help to see what is.\n"
/open /nonexistent/file.jsh

#= "|  /save is not available in this scratchpad. Type /help to see what is.\n"
/save /nonexistent/file.jsh

#= "|  /env -class-path is not available in this scratchpad. Type /help to see what is.\n"
/env -class-path /nonexistent/lib

#= "|  /set start is not available in this scratchpad. Type /help to see what is.\n"
/set start -none

#= "|  /set mode is not available in this scratchpad. Type /help to see what is.\n"
/set mode

#= "|  /set prompt is not available in this scratchpad. Type /help to see what is.\n"
/set prompt

#= "|  /reset -class-path is not available in this scratchpad. Type /help to see what is.\n"
/reset -class-path /nonexistent/lib

#! frames
/exit Integer.parseInt("x")

/exit (Integer) null

/exit { }

/exit 'a'

/exit 2.5

/exit "s"

/exit
