import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(0)
            
            RoommatesView()
                .tabItem {
                    Label("Roommates", systemImage: "person.2.fill")
                }
                .tag(1)
            
            CommunityView()
                .tabItem {
                    Label("Community", systemImage: "bubble.left.and.bubble.right.fill")
                }
                .tag(2)
            
            MessagesView()
                .tabItem {
                    Label("Messages", systemImage: "message.fill")
                }
                .tag(3)
            
            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person.circle.fill")
                }
                .tag(4)
        }
        .tint(Color.collegioOrange)
    }
}

#Preview {
    ContentView()
}
