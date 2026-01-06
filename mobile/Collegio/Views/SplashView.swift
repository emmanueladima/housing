import SwiftUI

struct SplashView: View {
    @State private var isActive = false
    @State private var logoOpacity: Double = 1  // Start visible to match LaunchScreen
    
    // Beige color #e4e2dd - exact match to LaunchScreen storyboard
    private let beigeBackground = Color(red: 0.89411764705882357, green: 0.88627450980392153, blue: 0.8666666666666667)
    
    var body: some View {
        if isActive {
            RootView()  // Changed from ContentView to RootView
        } else {
            GeometryReader { geometry in
                ZStack {
                    beigeBackground
                        .ignoresSafeArea()
                    
                    // Center logo exactly in the full screen (matching LaunchScreen which ignores safe areas)
                    Image("CollegioLogo")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 140, height: 140)
                        .opacity(logoOpacity)
                        .position(x: geometry.size.width / 2, y: geometry.size.height / 2)
                }
            }
            .ignoresSafeArea()
            .onAppear {
                // Short hold, then fade out
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
                    withAnimation(.easeOut(duration: 0.4)) {
                        logoOpacity = 0.0
                    }
                    
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
                        isActive = true
                    }
                }
            }
        }
    }
}

#Preview {
    SplashView()
}
