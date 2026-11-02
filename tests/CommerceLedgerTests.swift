import Foundation
@main enum LedgerTests {
    static func main() {
        var now=100.0;var data: Data?
        func make() -> CommerceLedger { CommerceLedger(load:{data},save:{data=$0;return true},clock:{now}) }
        var ledger=make()
        precondition(ledger.remaining==3);precondition(ledger.consume(run:"r1",receipt:"a1"));precondition(!ledger.consume(run:"r1",receipt:"a2"));precondition(!ledger.consume(run:"r2",receipt:"a1"))
        precondition(ledger.consume(run:"r2",receipt:"a2"));precondition(ledger.consume(run:"r3",receipt:"a3"));precondition(!ledger.consume(run:"r4",receipt:"a4"));precondition(ledger.remaining==0)
        ledger=make();precondition(ledger.remaining==0);now=10;precondition(ledger.remaining==0);now+=86399;precondition(ledger.remaining==0);now+=2;precondition(ledger.remaining==3);precondition(!ledger.consume(run:"r1",receipt:"new"));precondition(ledger.consume(run:"fresh",receipt:"fresh"))
        let fail=CommerceLedger(load:{nil},save:{_ in false},clock:{now});precondition(fail.remaining==0);precondition(!fail.consume(run:"x",receipt:"y"))
        print("COMMERCE_LEDGER_PASS: daily/session/replay, persistence, civil clock independence, conservative reboot, failed storage")
    }
}
