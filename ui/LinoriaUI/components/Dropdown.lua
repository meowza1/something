-- Dropdown Component for Linoria UI
-- Inherits from BaseComponent

local BaseComponent = require(script.Parent.BaseComponent)
local Utility = require(script.Parent.Parent.utils.Utility)

local Dropdown = {}
Dropdown.__index = Dropdown
setmetatable(Dropdown, BaseComponent)

function Dropdown.new(options)
    local self = BaseComponent.new(options)
    setmetatable(self, Dropdown)
    
    -- Dropdown specific properties
    self.Options = options.Options or {}
    self.SelectedOption = options.SelectedOption or self.Options[1] or ""
    self.Callback = options.Callback or function() end
    self.Width = options.Width or 200
    self.Height = options.Height or 30
    self.ListHeight = options.ListHeight or 150
    
    -- Update size
    self.Frame.Size = UDim2.new(0, self.Width, 0, self.Height)
    
    -- Create dropdown UI
    self:CreateUI()
    
    return self
end

function Dropdown:CreateUI()
    -- Main button
    self.Button = Instance.new("TextButton")
    self.Button.Name = "DropdownButton"
    self.Button.Parent = self.Frame
    self.Button.BackgroundColor3 = Utility.Colors.Background
    self.Button.BorderColor3 = Utility.Colors.Border
    self.Button.Size = UDim2.new(1, 0, 1, 0)
    self.Button.Text = self.SelectedOption
    self.Button.TextColor3 = Utility.Colors.Text
    self.Button.Font = Enum.Font.SourceSans
    self.Button.TextSize = 14
    self.Button.AutoButtonColor = false
    
    -- Dropdown arrow
    self.Arrow = Instance.new("ImageLabel")
    self.Arrow.Name = "DropdownArrow"
    self.Arrow.Parent = self.Button
    self.Arrow.BackgroundTransparency = 1
    self.Arrow.Position = UDim2.new(1, -20, 0.5, -8)
    self.Arrow.Size = UDim2.new(0, 16, 0, 16)
    self.Arrow.Image = "rbxassetid://6031091000" -- Down arrow
    self.Arrow.ImageColor3 = Utility.Colors.Text
    
    -- Dropdown list
    self.List = Instance.new("ScrollingFrame")
    self.List.Name = "DropdownList"
    self.List.Parent = self.Frame
    self.List.BackgroundColor3 = Utility.Colors.Background
    self.List.BorderColor3 = Utility.Colors.Border
    self.List.Position = UDim2.new(0, 0, 1, 0)
    self.List.Size = UDim2.new(1, 0, 0, self.ListHeight)
    self.List.Visible = false
    self.List.ScrollBarThickness = 4
    self.List.CanvasSize = UDim2.new(0, 0, 0, 0)
    
    -- List layout
    self.ListLayout = Instance.new("UIListLayout")
    self.ListLayout.Parent = self.List
    self.ListLayout.SortOrder = Enum.SortOrder.LayoutOrder
    self.ListLayout.Padding = UDim.new(0, 2)
    
    -- Populate options
    self:PopulateOptions()
    
    -- Button click to toggle list
    self.Button.MouseButton1Click:Connect(function()
        self.List.Visible = not self.List.Visible
        self.Arrow.Rotation = self.List.Visible and 180 or 0
    end)
    
    -- Close list when clicking outside
    game:GetService("UserInputService").InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or
           input.UserInputType == Enum.UserInputType.Touch then
            if self.List.Visible then
                local mousePos = input.Position
                local buttonPos = self.Button.AbsolutePosition
                local buttonSize = self.Button.AbsoluteSize
                
                if not (mousePos.X >= buttonPos.X and 
                       mousePos.X <= buttonPos.X + buttonSize.X and
                       mousePos.Y >= buttonPos.Y and
                       mousePos.Y <= buttonPos.Y + buttonSize.Y) then
                    -- Check if click is on list
                    local listPos = self.List.AbsolutePosition
                    local listSize = self.List.AbsoluteSize
                    
                    if not (mousePos.X >= listPos.X and 
                           mousePos.X <= listPos.X + listSize.X and
                           mousePos.Y >= listPos.Y and
                           mousePos.Y <= listPos.Y + listSize.Y) then
                        self.List.Visible = false
                        self.Arrow.Rotation = 0
                    end
                end
            end
        end
    end)
end

function Dropdown:PopulateOptions()
    -- Clear existing options
    for _, child in ipairs(self.List:GetChildren()) do
        if child:IsA("TextButton") then
            child:Destroy()
        end
    end
    
    -- Add options
    for i, option in ipairs(self.Options) do
        local optionBtn = Instance.new("TextButton")
        optionBtn.Name = "Option_"..i
        optionBtn.Parent = self.List
        optionBtn.BackgroundColor3 = Utility.Colors.Background
        optionBtn.BorderColor3 = Utility.Colors.Border
        optionBtn.Size = UDim2.new(1, 0, 0, 30)
        optionBtn.Text = option
        optionBtn.TextColor3 = Utility.Colors.Text
        optionBtn.Font = Enum.Font.SourceSans
        optionBtn.TextSize = 14
        optionBtn.AutoButtonColor = false
        
        optionBtn.MouseButton1Click:Connect(function()
            self.SelectedOption = option
            self.Button.Text = option
            self.List.Visible = false
            self.Arrow.Rotation = 0
            self.Callback(option)
        end)
        
        -- Hover effect
        optionBtn.MouseEnter:Connect(function()
            optionBtn.BackgroundColor3 = Utility.Colors.HoverBackground
        end)
        
        optionBtn.MouseLeave:Connect(function()
            optionBtn.BackgroundColor3 = Utility.Colors.Background
        end)
    end
    
    -- Update canvas size
    self.List.CanvasSize = UDim2.new(0, 0, 0, #self.Options * 32)
end

function Dropdown:SetOptions(options)
    self.Options = options
    if #self.Options > 0 and (not self.SelectedOption or not table.find(self.Options, self.SelectedOption)) then
        self.SelectedOption = self.Options[1]
        self.Button.Text = self.SelectedOption
    end
    self:PopulateOptions()
end

function Dropdown:GetSelected()
    return self.SelectedOption
end

function Dropdown:SetSelected(option)
    if table.find(self.Options, option) then
        self.SelectedOption = option
        self.Button.Text = option
        self.Callback(option)
    end
end

return Dropdown