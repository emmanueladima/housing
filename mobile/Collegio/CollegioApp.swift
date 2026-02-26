import SwiftUI
import MapboxMaps

@main
struct CollegioApp: App {
    @AppStorage("isDarkMode") private var isDarkMode = false
    
    init() {
        // Configure Mapbox access token
        MapboxOptions.accessToken = "pk.eyJ1IjoiZW1tYW51ZWxhZGltYSIsImEiOiJjbWl0c3I4a3oxZ21hM2ZweTJ6NjlpbDhtIn0.hDng3N8TU26VMra73JbCmA"
    }
    
    var body: some Scene {
        WindowGroup {
            SplashView()
        }
    }
}
