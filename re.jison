%lex
%%

[a-zA-Z0-9]           return 'CHAR'
"|"                   return '|'
"*"                   return '*'
"+"                   return '+'
"("                   return '('
")"                   return ')'
"."                   return '.'
<<EOF>>               return 'EOF';
.                     return 'INVALID'

/lex

%start expr

%%
expr
    : RE EOF
        {return $1;}
    ;
RE
    : union
        {$$ = $1;}
    | simple-RE
        {$$ = $1;}
    ;
union
    : RE "|" simple-RE
        {$$ = ["union", $1, $3];}
    ;
simple-RE
    : concatenation
        {$$ = $1;}
    | basic-RE
        {$$ = $1;}
    ;
concatenation
    : simple-RE basic-RE
        {$$ = ["concatenation", $1, $2];}
    ;
basic-RE
    : star
        {$$ = $1;}
    | plus
        {$$ = $1;}
    | elementary-RE
        {$$ = $1;}
    ;
star
    : elementary-RE "*"
        {$$ = ["star", $1];}
    ;
plus
    : elementary-RE "+"
        {$$ = ["plus", $1];}
    ;
elementary-RE
    : group
        {$$ = $1;}
    | any
        {$$ = $1;}
    | char
        {$$ = $1;}
    ;
group
    : "(" RE ")"
        {$$ = $2;}
    ;
any
    : "."
        {$$ = ["any"];}
    ;
char
    : CHAR
        {$$ = ["char", $1];}
    ;
