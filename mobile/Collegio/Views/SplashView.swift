import SwiftUI

struct SplashView: View {
    @State private var isActive = false
    @State private var logoOpacity: Double = 0
    @State private var logoScale: CGFloat = 0.85
    
    // Beige color #e4e2dd
    private let beigeBackground = Color(red: 0.894, green: 0.886, blue: 0.867)
    
    var body: some View {
        if isActive {
            ContentView()
        } else {
            ZStack {
                beigeBackground
                    .ignoresSafeArea()
                
                Image("CollegioLogo")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 140, height: 140)
                    .opacity(logoOpacity)
                    .scaleEffect(logoScale)
            }
            .onAppear {
                // Quick fade in
                withAnimation(.easeOut(duration: 0.5)) {
                    logoOpacity = 1.0
                    logoScale = 1.0
                }
                
                // Short hold, then fade out completely
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
                    withAnimation(.easeIn(duration: 0.3)) {
                        logoOpacity = 0.0
                    }
                    
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
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
