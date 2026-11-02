package com.mertbekisoglu.bulusko;
import java.util.*;
import java.util.function.*;

/** Uptime-only rolling quota; unrelated to the game's resettable preferences or civil clock. */
final class CommerceLedger {
    static final class State {
        double last; final List<Double> ages; final List<String> runs, receipts;
        State(double last,List<Double> ages,List<String> runs,List<String> receipts) { this.last=last;this.ages=new ArrayList<>(ages);this.runs=new ArrayList<>(runs);this.receipts=new ArrayList<>(receipts); }
        State copy(){return new State(last,ages,runs,receipts);}
    }
    private State state; private final DoubleSupplier clock; private final Predicate<State> save;
    CommerceLedger(State state,DoubleSupplier clock,Predicate<State> save){this.state=state;this.clock=clock;this.save=save;}
    private void advance(){double now=clock.getAsDouble(),delta=Math.max(0,now-state.last);state.ages.replaceAll(age->age+delta);state.ages.removeIf(age->age>=86400);state.last=now;}
    int remaining(){advance();return save.test(state.copy())?Math.max(0,3-state.ages.size()):0;}
    boolean consume(String run,String receipt){advance();if(state.ages.size()>=3||state.runs.contains(run)||state.receipts.contains(receipt))return false;State before=state.copy();state.ages.add(0d);state.runs.add(run);state.receipts.add(receipt);while(state.runs.size()>256)state.runs.remove(0);while(state.receipts.size()>256)state.receipts.remove(0);if(save.test(state.copy()))return true;state=before;return false;}
}
