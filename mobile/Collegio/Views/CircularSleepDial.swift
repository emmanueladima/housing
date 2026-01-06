import SwiftUI

/// A circular clock dial for selecting sleep schedule (bedtime and wake time)
struct CircularSleepDial: View {
    @Binding var bedtime: Double  // Hour in 24h format (e.g., 23 for 11 PM)
    @Binding var wakeTime: Double // Hour in 24h format (e.g., 8 for 8 AM)
    
    private let dialSize: CGFloat = 160
    private let handleSize: CGFloat = 26
    private let trackWidth: CGFloat = 18
    
    var body: some View {
        VStack(spacing: 16) {
            // Header
            HStack {
                Label("Sleep Schedule", systemImage: "moon.fill")
                    .font(.subheadline.bold())
                    .foregroundStyle(Color.black)
                Spacer()
                Text(sleepDuration)
                    .font(.caption)
                    .foregroundStyle(Color(white: 0.5))
            }
            
            ZStack {
                // Clock face background
                Circle()
                    .stroke(Color(white: 0.9), lineWidth: trackWidth)
                    .frame(width: dialSize, height: dialSize)
                
                // Sleep arc (colored portion)
                SleepArc(startAngle: hourToAngle(bedtime), endAngle: hourToAngle(wakeTime))
                    .stroke(
                        LinearGradient(
                            colors: [Color.collegioOrange.opacity(0.8), Color.collegioOrange],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        style: StrokeStyle(lineWidth: trackWidth, lineCap: .round)
                    )
                    .frame(width: dialSize, height: dialSize)
                
                // Hour markers
                ForEach(0..<24, id: \.self) { hour in
                    let angle = hourToAngle(Double(hour))
                    let isMainHour = hour % 6 == 0
                    
                    VStack {
                        if isMainHour {
                            Text(formatHour(hour))
                                .font(.caption2.bold())
                                .foregroundStyle(Color(white: 0.4))
                                .rotationEffect(.degrees(-angle)) // Counter-rotate label so text stays upright
                        } else {
                            Circle()
                                .fill(Color(white: 0.7))
                                .frame(width: 3, height: 3)
                        }
                    }
                    // Labels positioned well outside the circle
                    .offset(y: -dialSize / 2 - (isMainHour ? 20 : -trackWidth / 2 - 4))
                    .rotationEffect(.degrees(angle))
                }
                
                // Center display
                VStack(spacing: 2) {
                    HStack(spacing: 4) {
                        Image(systemName: "moon.fill")
                            .font(.system(size: 12))
                            .foregroundStyle(Color.collegioOrange)
                        Text(formatTime(bedtime))
                            .font(.footnote.bold())
                            .foregroundStyle(Color.black)
                    }
                    
                    Rectangle()
                        .fill(Color(white: 0.85))
                        .frame(width: 50, height: 1)
                    
                    HStack(spacing: 4) {
                        Image(systemName: "sun.max.fill")
                            .font(.system(size: 12))
                            .foregroundStyle(Color.yellow)
                        Text(formatTime(wakeTime))
                            .font(.footnote.bold())
                            .foregroundStyle(Color.black)
                    }
                }
                
                // Bedtime handle (moon)
                HandleIcon(icon: "moon.fill", color: Color.collegioOrange)
                    .offset(handleOffset(for: bedtime))
                    .gesture(
                        DragGesture()
                            .onChanged { value in
                                let center = CGPoint(x: dialSize / 2, y: dialSize / 2)
                                let location = CGPoint(x: value.location.x + dialSize / 2 - handleSize / 2,
                                                       y: value.location.y + dialSize / 2 - handleSize / 2)
                                let angle = atan2(location.y - center.y, location.x - center.x)
                                bedtime = angleToHour(angle)
                            }
                    )
                
                // Wake time handle (sun)
                HandleIcon(icon: "sun.max.fill", color: Color.yellow)
                    .offset(handleOffset(for: wakeTime))
                    .gesture(
                        DragGesture()
                            .onChanged { value in
                                let center = CGPoint(x: dialSize / 2, y: dialSize / 2)
                                let location = CGPoint(x: value.location.x + dialSize / 2 - handleSize / 2,
                                                       y: value.location.y + dialSize / 2 - handleSize / 2)
                                let angle = atan2(location.y - center.y, location.x - center.x)
                                wakeTime = angleToHour(angle)
                            }
                    )
            }
            .frame(width: dialSize + 50, height: dialSize + 50)
        }
        .padding()
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color(white: 0.85), lineWidth: 1))
    }
    
    // MARK: - Helpers
    
    private var sleepDuration: String {
        var hours = wakeTime - bedtime
        if hours < 0 { hours += 24 }
        return String(format: "%.0fh sleep", hours)
    }
    
    private func hourToAngle(_ hour: Double) -> Double {
        return (hour * 15) - 90
    }
    
    private func angleToHour(_ angle: Double) -> Double {
        var degrees = angle * 180 / .pi + 90
        if degrees < 0 { degrees += 360 }
        let hour = (degrees / 15).truncatingRemainder(dividingBy: 24)
        return round(hour)
    }
    
    // Simple trig using Darwin module (Double type is unambiguous)
    private func handleOffset(for hour: Double) -> CGSize {
        let angleDegrees = hourToAngle(hour)
        let angleRadians = angleDegrees * Double.pi / 180.0
        let radius = Double(dialSize / 2)
        let x = Darwin.cos(angleRadians) * radius
        let y = Darwin.sin(angleRadians) * radius
        return CGSize(width: x, height: y)
    }
    
    private func formatHour(_ hour: Int) -> String {
        switch hour {
        case 0: return "12a"
        case 6: return "6a"
        case 12: return "12p"
        case 18: return "6p"
        default: return ""
        }
    }
    
    private func formatTime(_ hour: Double) -> String {
        let h = Int(hour) % 24
        let ampm = h >= 12 ? "PM" : "AM"
        let displayHour = h > 12 ? h - 12 : (h == 0 ? 12 : h)
        return "\(displayHour):00 \(ampm)"
    }
}

// MARK: - Sleep Arc Shape
struct SleepArc: Shape {
    var startAngle: Double
    var endAngle: Double
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let center = CGPoint(x: rect.midX, y: rect.midY)
        let radius = min(rect.width, rect.height) / 2
        
        var end = endAngle
        if end < startAngle { end += 360 }
        
        path.addArc(
            center: center,
            radius: radius,
            startAngle: .degrees(startAngle),
            endAngle: .degrees(end),
            clockwise: false
        )
        
        return path
    }
}

// MARK: - Handle Icon
struct HandleIcon: View {
    let icon: String
    let color: Color
    
    var body: some View {
        ZStack {
            Circle()
                .fill(Color.white)
                .frame(width: 26, height: 26)
                .shadow(color: .black.opacity(0.15), radius: 3, x: 0, y: 2)
            
            Image(systemName: icon)
                .font(.system(size: 11, weight: .bold))
                .foregroundStyle(color)
        }
    }
}

#Preview {
    VStack {
        CircularSleepDial(bedtime: .constant(23), wakeTime: .constant(7))
    }
    .padding()
    .background(Color(red: 0.894, green: 0.886, blue: 0.867))
}
