-- Textbox Component for Linoria UI
-- Inherits from BaseComponent
-- Supports text input with placeholder

local BaseComponent = require(script.Parent.BaseComponent)
local Utility = require(script.Parent.Parent.utils.Utility)

local Textbox = {}
Textbox.__index = Textbox
setmetatable(Textbox, BaseComponent)

function Textbox.new(options)
    local self = BaseComponent.new(options)
    setmetatable(self, Textbox)
    
    -- Textbox specific properties
    self.Placeholder = options.Placeholder or "Enter text..."
    self.Text = options.Text or ""
    self.ClearTextOnFocus = options.ClearTextOnFocus ~= nil and options.ClearTextOnFocus or true
    self.Callback = options.Callback or function() end
    self.Width = options.Width or 200
    self.Height = options.Height or 30
    
    -- Update size
    self.Frame.Size = UDim2.new(0, self.Width, 0, self.Height)
    
    -- Create textbox UI
    self:CreateUI()
    
    return self
end

function Textbox:CreateUI()
    -- Text box frame
    self.TextBox = Instance.new("TextBox")
    self.TextBox.Name = "TextBox"
    self.TextBox.Parent = self.Frame
    self.TextBox.BackgroundColor3 = Utility.Colors.Background
    self.TextBox.BorderColor3 = Utility.Colors.Border
    self.TextBox.Size = UDim2.new(1, 0, 1, 0)
    self.TextBox.Position = UDim2.new(0, 0, 0, 0)
    self.TextBox.Text = self.Text
    self.TextBox.PlaceholderText = self.Placeholder
    self.TextBox.TextColor3 = Utility.Colors.Text
    self.TextBox.PlaceholderColor3 = Utility.Colors.Placeholder
    self.TextBox.Font = Enum.Font.SourceSans
    self.TextBox.TextSize = 14
    self.TextBox.ClearTextOnFocus = self.ClearTextOnFocus
    
    -- Corner radius
    self.Corner = Instance.new("UICorner")
    self.Corner.CornerRadius = UDim.new(0, 4)
    self.Corner.Parent = self.TextBox
    
    -- Focus lost (when enter pressed or focus lost)
    self.TextBox.FocusLost:Connect(function(enterPressed)
        self.Text = self.TextBox.Text
        self.Callback(self.Text, enterPressed)
    end)
    
    -- Text changed (for live updates)
    self.TextBox.Changed:Connect(function(property)
        if property == "Text" then
            self.Text = self.TextBox.Text
            -- Optional: could add a live callback here if needed
        end
    end)
end

function Textbox:GetText()
    return self.Text
end

function Textbox:SetText(text)
    self.Text = text
    self.TextBox.Text = text
end

function Textbox:SetPlaceholder(placeholder)
    self.Placeholder = placeholder
    self.TextBox.PlaceholderText = placeholder
end

function Textbox:Clear()
    self.TextBox.Text = ""
    self.Text = ""
end

return Textbox