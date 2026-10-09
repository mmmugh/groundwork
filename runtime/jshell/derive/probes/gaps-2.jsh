# G10: /reload with a multi-line method, a statement that prints, a warning, a two-declarator line and a rerun
int twice(int n) {
    return n * 2;
}

System.out.println("side effect")

java.util.List raw = new java.util.ArrayList(); raw.add(1);

int p = 1, q = 2;

twice(5)

/!

/reload

/list

# G11: /reload -restore after /reset, and /reload after /reset
/reset

/reload

/reload -restore

/list

# G9: errors and fluff in silent mode
/set feedback silent

/nosuch

/d

/drop

/drop nosuch

/reset

/reload

/set feedback nonsense

# G8: /exit in silent mode
/exit
