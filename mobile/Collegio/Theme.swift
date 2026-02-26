import SwiftUI

// MARK: - Brand Colors (Matching Website)
extension Color {
    // Primary Orange (Website: #DB4A2B)
    static let collegioOrange = Color(red: 0.859, green: 0.290, blue: 0.169)
    static let collegioOrangeLight = Color(red: 0.910, green: 0.365, blue: 0.247) // #E85D3F
    static let collegioOrangeDark = Color(red: 0.690, green: 0.212, blue: 0.110) // #B0361C
    
    // Beige/Warm Background (Website: #E4E2DD)
    static let collegioBeige = Color(red: 0.894, green: 0.886, blue: 0.867)
    
    // Teal Accent (Website: #0F766E)
    static let collegioTeal = Color(red: 0.059, green: 0.463, blue: 0.431)
    static let collegioTealDeep = Color(red: 0.173, green: 0.373, blue: 0.373) // #2C5F5F
    
    // Navy/Slate (Website: #1E293B)
    static let collegioNavy = Color(red: 0.118, green: 0.161, blue: 0.231)
    static let collegioSlate = Color(red: 0.200, green: 0.255, blue: 0.333) // #334155
    
    // Sage Green (Website: #849b87)
    static let collegioSage = Color(red: 0.518, green: 0.608, blue: 0.529)
    
    // Blue accent (for secondary elements)
    static let collegioBlue = Color(red: 0.20, green: 0.40, blue: 0.80)
    
    // Background gradients for dark mode
    static let darkGradientStart = Color(red: 0.08, green: 0.10, blue: 0.14)
    static let darkGradientEnd = Color(red: 0.12, green: 0.14, blue: 0.20)
    
    // Glass effect colors
    static let glassBackground = Color.white.opacity(0.12)
    static let glassBorder = Color.white.opacity(0.20)
}

// MARK: - Glass Card Modifier
struct GlassCardStyle: ViewModifier {
    @Environment(\.colorScheme) var colorScheme
    var cornerRadius: CGFloat = 20
    
    func body(content: Content) -> some View {
        content
            .background {
                if colorScheme == .dark {
                    RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                        .fill(.ultraThinMaterial)
                        .shadow(color: .black.opacity(0.35), radius: 20, x: 0, y: 12)
                } else {
                    RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                        .fill(.regularMaterial)
                        .shadow(color: .black.opacity(0.08), radius: 15, x: 0, y: 8)
                }
            }
            .overlay {
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .stroke(colorScheme == .dark ? Color.white.opacity(0.12) : Color.white.opacity(0.5), lineWidth: 0.5)
            }
    }
}

// MARK: - Filter Pill Style (Border-Only Active State)
struct FilterPillStyle: ViewModifier {
    var isActive: Bool = false
    @Environment(\.colorScheme) var colorScheme
    
    func body(content: Content) -> some View {
        content
            .font(.body.weight(.medium))
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
            .background {
                Capsule()
                    .fill(colorScheme == .dark ? Color.white.opacity(0.06) : Color.white)
            }
            .overlay {
                Capsule()
                    .strokeBorder(
                        isActive 
                            ? Color.collegioOrange
                            : (colorScheme == .dark ? Color.white.opacity(0.2) : Color.black.opacity(0.15)),
                        lineWidth: isActive ? 2.5 : 1.0
                    )
            }
            .shadow(color: colorScheme == .dark ? .clear : Color.black.opacity(0.08), radius: 4, x: 0, y: 2)
            .foregroundStyle(colorScheme == .dark ? .white : .primary)
    }
}

// MARK: - Gradient Background
struct GradientBackground: View {
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        ZStack {
            if colorScheme == .dark {
                // Pure black background for dark mode
                Color.black
            } else {
                // Light mode: subtle warm gradient
                LinearGradient(
                    colors: [
                        Color.collegioBeige.opacity(0.3),
                        Color.white,
                        Color.white
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            }
        }
        .ignoresSafeArea()
        .animation(.easeInOut(duration: 0.2), value: colorScheme)
    }
}

// MARK: - View Extensions
extension View {
    func glassCard(cornerRadius: CGFloat = 20) -> some View {
        modifier(GlassCardStyle(cornerRadius: cornerRadius))
    }
    
    func filterPill(isActive: Bool = false) -> some View {
        modifier(FilterPillStyle(isActive: isActive))
    }
}

// MARK: - Button Styles
struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline)
            .foregroundStyle(.white)
            .padding(.horizontal, 24)
            .padding(.vertical, 14)
            .background {
                Capsule()
                    .fill(
                        LinearGradient(
                            colors: [Color.collegioOrange, Color.collegioOrangeDark],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .shadow(color: Color.collegioOrange.opacity(0.4), radius: configuration.isPressed ? 4 : 10, x: 0, y: configuration.isPressed ? 2 : 5)
            }
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.spring(response: 0.3, dampingFraction: 0.6), value: configuration.isPressed)
    }
}

struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline)
            .foregroundStyle(Color.collegioOrange)
            .padding(.horizontal, 24)
            .padding(.vertical, 14)
            .background {
                Capsule()
                    .fill(.ultraThinMaterial)
            }
            .overlay {
                Capsule()
                    .stroke(Color.collegioOrange.opacity(0.5), lineWidth: 1.5)
            }
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.spring(response: 0.3, dampingFraction: 0.6), value: configuration.isPressed)
    }
}

extension ButtonStyle where Self == PrimaryButtonStyle {
    static var primary: PrimaryButtonStyle { PrimaryButtonStyle() }
}

extension ButtonStyle where Self == SecondaryButtonStyle {
    static var secondary: SecondaryButtonStyle { SecondaryButtonStyle() }
}

#Preview("Theme Colors") {
    VStack(spacing: 20) {
        HStack(spacing: 12) {
            Circle().fill(Color.collegioOrange).frame(width: 50, height: 50)
            Circle().fill(Color.collegioTeal).frame(width: 50, height: 50)
            Circle().fill(Color.collegioNavy).frame(width: 50, height: 50)
            Circle().fill(Color.collegioSage).frame(width: 50, height: 50)
        }
        
        Button("Primary Button") {}
            .buttonStyle(.primary)
        
        Button("Secondary Button") {}
            .buttonStyle(.secondary)
        
        Text("Glass Card")
            .padding(30)
            .glassCard()
    }
    .padding()
    .background(GradientBackground())
}

#Preview("Dark Theme") {
    VStack(spacing: 20) {
        HStack(spacing: 12) {
            Circle().fill(Color.collegioOrange).frame(width: 50, height: 50)
            Circle().fill(Color.collegioTeal).frame(width: 50, height: 50)
            Circle().fill(Color.collegioNavy).frame(width: 50, height: 50)
            Circle().fill(Color.collegioSage).frame(width: 50, height: 50)
        }
        
        Button("Primary Button") {}
            .buttonStyle(.primary)
        
        Text("Glass Card")
            .padding(30)
            .glassCard()
    }
    .padding()
    .background(GradientBackground())
    .preferredColorScheme(.dark)
}
