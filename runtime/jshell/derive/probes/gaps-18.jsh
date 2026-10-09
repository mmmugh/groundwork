# G27: /reload replaying a /drop by id after a refused /exit kept an id (review F7); an overflowing second rerun word (F8)
/exit "a"

int a = 1;

int b = 2;

/drop 3

/list -all

/reload

/vars

/list -all

/drop 2

/reload -quiet

/vars

/-1 -99999999999

/1 -99999999999

/-1 99999999999

/1-2 -1
