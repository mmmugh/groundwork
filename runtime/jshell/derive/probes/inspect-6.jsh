# one line, one hundred snippets
int v1=1;int v2=2;int v3=3;int v4=4;int v5=5;int v6=6;int v7=7;int v8=8;int v9=9;int v10=10;int v11=11;int v12=12;int v13=13;int v14=14;int v15=15;int v16=16;int v17=17;int v18=18;int v19=19;int v20=20;int v21=21;int v22=22;int v23=23;int v24=24;int v25=25;int v26=26;int v27=27;int v28=28;int v29=29;int v30=30;int v31=31;int v32=32;int v33=33;int v34=34;int v35=35;int v36=36;int v37=37;int v38=38;int v39=39;int v40=40;int v41=41;int v42=42;int v43=43;int v44=44;int v45=45;int v46=46;int v47=47;int v48=48;int v49=49;int v50=50;int v51=51;int v52=52;int v53=53;int v54=54;int v55=55;int v56=56;int v57=57;int v58=58;int v59=59;int v60=60;int v61=61;int v62=62;int v63=63;int v64=64;int v65=65;int v66=66;int v67=67;int v68=68;int v69=69;int v70=70;int v71=71;int v72=72;int v73=73;int v74=74;int v75=75;int v76=76;int v77=77;int v78=78;int v79=79;int v80=80;int v81=81;int v82=82;int v83=83;int v84=84;int v85=85;int v86=86;int v87=87;int v88=88;int v89=89;int v90=90;int v91=91;int v92=92;int v93=93;int v94=94;int v95=95;int v96=96;int v97=97;int v98=98;int v99=99;int v100=100;

# list after a hundred
/list

# list range across digits
/list 98-101

# list id 100
/list 100

# multi-line snippet at id 101
int m101() {
    return 101;
}

# multi-line var at id 102
String[] words = {
    "a",
    "b"
}

# list tail with multi-line at 3 digits
/list m101 words

# list -all at 3 digits
/list -all

# history of multi-line
/history

# method redefined same signature
int m101() {
    return 202;
}

# list m101
/list m101

# vars two
/vars v1 v100

# drop by 3 digit id
/drop 100

# list 100 after drop
/list 100

# vars
/vars v99 v100

# rejected multi line
int bad() {
    return "s";
}

# list -all tail
/list -all
