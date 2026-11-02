package com.mertbekisoglu.bulusko;
import java.util.*;
public final class CommerceLedgerTests {
    public static void main(String[] args){double[] clock={100};CommerceLedger.State[] persisted={null};CommerceLedger l=new CommerceLedger(new CommerceLedger.State(100,List.of(),List.of(),List.of()),()->clock[0],s->{persisted[0]=s;return true;});
        check(l.remaining()==3);check(l.consume("run1","ad1"));check(!l.consume("run1","ad2"));check(!l.consume("run2","ad1"));check(l.consume("run2","ad2"));check(l.consume("run3","ad3"));check(!l.consume("run4","ad4"));check(l.remaining()==0);
        // Persist/reopen and civil clock manipulation have no effect: only uptime is an input.
        l=new CommerceLedger(persisted[0],()->clock[0],s->{persisted[0]=s;return true;});check(l.remaining()==0);clock[0]=10;check(l.remaining()==0);clock[0]+=86399;check(l.remaining()==0);clock[0]+=2;check(l.remaining()==3);check(!l.consume("run1","ad99"));check(l.consume("newrun","newad"));
        CommerceLedger fail=new CommerceLedger(new CommerceLedger.State(clock[0],List.of(),List.of(),List.of()),()->clock[0],s->false);check(fail.remaining()==0);check(!fail.consume("a","b"));
        System.out.println("COMMERCE_LEDGER_PASS: daily/session/replay, persistence, civil clock independence, conservative reboot, failed storage");
    }
    private static void check(boolean value){if(!value)throw new AssertionError();}
}
