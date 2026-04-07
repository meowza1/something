-- Example usage of Linoria UI Library
-- IMPORTANT: Replace YOUR_USERNAME and YOUR_REPO with your actual GitHub details
-- Load with: loadstring(game:HttpGet("https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/LinoriaUI.lua"))()

-- For testing in Roblox Studio, you can also use:
-- loadstring(game:HttpGet("https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/LinoriaUI.lua"))()

local Linoria = loadstring(game:HttpGet("https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/LinoriaUI.lua"))()

-- Create main window
local Window = Linoria:CreateWindow({
    Title = "Linoria UI Example",
    Size = UDim2.new(0, 550, 0, 450),
    Position = UDim2.new(0.5, -275, 0.5, -225),
    Draggable = true,
    Theme = {
        -- Optional: Customize theme colors
        -- Accent = Color3.fromRGB(100, 200, 100),
    }
})

-- =============================================
-- TAB 1: Main Features
-- =============================================
local MainTab = Window:AddTab("Main")
MainTab:AddColumn(2) -- 2 columns

-- Section
MainTab:AddSection({
    Text = "Combat",
})

-- Toggle
local CombatToggle = MainTab:AddToggle({
    Text = "Enable Combat",
    Default = false,
    Callback = function(value)
        print("Combat toggled:", value)
    end
})

-- Dropdown
local WeaponDropdown = MainTab:AddDropdown({
    Text = "Weapon",
    Items = {"Sword", "Bow", "Axe", "Staff", "Dagger"},
    Default = "Sword",
    Callback = function(value)
        print("Selected weapon:", value)
    end
})

-- Slider
local DamageSlider = MainTab:AddSlider({
    Text = "Damage Multiplier",
    Min = 1,
    Max = 100,
    Default = 10,
    Callback = function(value)
        print("Damage:", value)
    end
})

-- Section
MainTab:AddSection({
    Text = "Movement",
})

-- Toggle
local SpeedToggle = MainTab:AddToggle({
    Text = "Speed Hack",
    Default = false,
    Callback = function(value)
        print("Speed hack:", value)
    end
})

-- Slider
local SpeedSlider = MainTab:AddSlider({
    Text = "Walk Speed",
    Min = 16,
    Max = 200,
    Default = 16,
    Callback = function(value)
        if game.Players.LocalPlayer.Character and game.Players.LocalPlayer.Character:FindFirstChild("Humanoid") then
            game.Players.LocalPlayer.Character.Humanoid.WalkSpeed = value
        end
    end
})

-- Textbox
local JumpTextbox = MainTab:AddTextbox({
    Text = "Jump Power",
    Default = "50",
    Placeholder = "Enter jump power...",
    Callback = function(value)
        local num = tonumber(value)
        if num and game.Players.LocalPlayer.Character and game.Players.LocalPlayer.Character:FindFirstChild("Humanoid") then
            game.Players.LocalPlayer.Character.Humanoid.JumpPower = num
        end
    end
})

-- =============================================
-- TAB 2: Visuals
-- =============================================
local VisualTab = Window:AddTab("Visuals")
VisualTab:AddColumn(2)

-- Section
VisualTab:AddSection({
    Text = "ESP"
})

-- Toggles
local PlayerESP = VisualTab:AddToggle({
    Text = "Player ESP",
    Default = false,
    Callback = function(value)
        print("Player ESP:", value)
    end
})

local ItemESP = VisualTab:AddToggle({
    Text = "Item ESP",
    Default = false,
    Callback = function(value)
        print("Item ESP:", value)
    end
})

-- Colorpicker
local ESPColor = VisualTab:AddColorpicker({
    Text = "ESP Color",
    Default = Color3.fromRGB(255, 0, 0),
    Callback = function(color)
        print("ESP Color changed to:", color)
    end
})

-- Section
VisualTab:AddSection({
    Text = "Rendering"
})

-- Dropdown
local RenderMode = VisualTab:AddDropdown({
    Text = "Render Mode",
    Items = {"Full", "Box", "Skeleton", "Glow"},
    Default = "Full",
    Callback = function(value)
        print("Render mode:", value)
    end
})

-- Slider
local RenderDistance = VisualTab:AddSlider({
    Text = "Render Distance",
    Min = 50,
    Max = 1000,
    Default = 500,
    Callback = function(value)
        print("Render distance:", value)
    end
})

-- =============================================
-- TAB 3: Settings
-- =============================================
local SettingsTab = Window:AddTab("Settings")
SettingsTab:AddColumn(1)

-- Section
SettingsTab:AddSection({
    Text = "UI Settings"
})

-- Theme color
local ThemeColor = SettingsTab:AddColorpicker({
    Text = "Theme Accent",
    Default = Color3.fromRGB(0, 120, 255),
    Callback = function(color)
        -- Could update theme dynamically
        print("Theme accent:", color)
    end
})

-- Radio buttons for theme
SettingsTab:AddSection({
    Text = "Theme Style"
})

local DarkRadio = SettingsTab:AddRadio({
    Text = "Dark Theme",
    Group = "theme",
    Default = true,
    Callback = function(value)
        if value then print("Dark theme selected") end
    end
})

local LightRadio = SettingsTab:AddRadio({
    Text = "Light Theme",
    Group = "theme",
    Default = false,
    Callback = function(value)
        if value then print("Light theme selected") end
    end
})

local MidnightRadio = SettingsTab:AddRadio({
    Text = "Midnight Theme",
    Group = "theme",
    Default = false,
    Callback = function(value)
        if value then print("Midnight theme selected") end
    end
})

-- Section
SettingsTab:AddSection({
    Text = "Keybind"
})

-- Textbox for keybind
local KeybindTextbox = SettingsTab:AddTextbox({
    Text = "Toggle Keybind",
    Default = "RightShift",
    Placeholder = "Enter key...",
    Callback = function(value)
        print("Keybind set to:", value)
    end
})

-- Section
SettingsTab:AddSection({
    Text = "Actions"
})

-- Buttons
local SaveButton = SettingsTab:AddButton({
    Text = "Save Config",
    Callback = function()
        print("Config saved!")
    end
})

local LoadButton = SettingsTab:AddButton({
    Text = "Load Config",
    Callback = function()
        print("Config loaded!")
    end
})

local ResetButton = SettingsTab:AddButton({
    Text = "Reset Settings",
    Callback = function()
        print("Settings reset!")
    end
})

-- =============================================
-- VISIBILITY API EXAMPLE
-- =============================================

-- Show/hide elements based on toggle state
CombatToggle.Callback = function(value)
    -- When combat is enabled, show combat-related settings
    WeaponDropdown:SetVisible(value)
    DamageSlider:SetVisible(value)
end

-- Initially hide combat settings until toggle is enabled
WeaponDropdown:SetVisible(false)
DamageSlider:SetVisible(false)

-- =============================================
-- KEYBIND TO TOGGLE UI
-- =============================================

game:GetService("UserInputService").InputBegan:Connect(function(input, gameProcessed)
    if gameProcessed then return end
    if input.KeyCode == Enum.KeyCode.RightShift then
        Window:Toggle()
    end
end)

-- Show window by default
Window:SetVisible(true)

print("Linoria UI loaded successfully!")
