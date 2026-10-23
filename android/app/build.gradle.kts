plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.mertbekisoglu.familytris"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.mertbekisoglu.familytris"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        buildConfig = true
    }
}
