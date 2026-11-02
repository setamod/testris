import Foundation
enum CommerceConfig {
 static let productID = "com.mertbekisoglu.bulusko.premium"
 static let storeEnabled = false
 #if DEBUG
 static let adsEnabled = true
 static let rewardedID = "ca-app-pub-3940256099942544/1712485313"
 #else
 static let adsEnabled = false
 static let rewardedID = ""
 #endif
}
