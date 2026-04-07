-- Linoria UI Library for Roblox - Single File Version
-- A modern UI library with Linoria styling, mobile support, draggable UI, colorpicker, etc.

local TweenService = game:GetService("TweenService")
local UserInputService = game:GetService("UserInputService")

local Linoria = {}

-- =============================================
-- UTILITY FUNCTIONS AND STYLES
-- =============================================

local Utility = {}
Utility.Colors = {
    Background = Color3.fromRGB(25, 25, 25),
    BackgroundLight = Color3.fromRGB(35, 35, 35),
    ContainerBackground = Color3.fromRGB(20, 20, 20),
    ContainerBorder = Color3.fromRGB(40, 40, 40),
    Border = Color3.fromRGB(50, 50, 50),
    Text = Color3.fromRGB(255, 255, 255),
    Placeholder = Color3.fromRGB(150, 150, 150),
    Accent = Color3.fromRGB(0, 120, 255),
    HoverBackground = Color3.fromRGB(40, 40, 40),
    TabBackground = Color3.fromRGB(30, 30, 30),
    TabSelected = Color3.fromRGB(40, 40, 40),
    ScrollBar = Color3.fromRGB(60, 60, 60),
    ColorpickerBackground = Color3.fromRGB(20, 20, 20),
    ColorpickerBorder = Color3.fromRGB(50, 50, 50),
}

function Utility:Create(instanceType, properties)
    local inst = Instance.new(instanceType)
    for prop, val in pairs(properties or {}) do
        inst[prop] = val
    end
    return inst
end

function Utility:CreateTween(obj, goal, duration, easingStyle, easingDirection)
    local tweenInfo = TweenInfo.new(
        duration or 0.2,
        easingStyle or Enum.EasingStyle.Quad,
        easingDirection or Enum.EasingDirection.Out
    )
    return TweenService:Create(obj, tweenInfo, goal)
end

function Utility:HexToColor(hex)
    hex = hex:gsub("#", "")
    local r = tonumber(hex:sub(1, 2), 16) or 0
    local g = tonumber(hex:sub(3, 4), 16) or 0
    local b = tonumber(hex:sub(5, 6), 16) or 0
    return Color3.fromRGB(r, g, b)
end

function Utility:ColorToHex(color)
    return string.format("#%02X%02X%02X", color.R * 255, color.G * 255, color.B * 255)
end

function Utility:ColorToRGB(color)
    return math.floor(color.R * 255), math.floor(color.G * 255), math.floor(color.B * 255)
end

function Utility:RGBToColor(r, g, b)
    return Color3.fromRGB(r, g, b)
end

function Utility:ColorToHSV(color)
    local r, g, b = color.R, color.G, color.B
    local max, min = math.max(r, g, b), math.min(r, g, b)
    local h, s, v
    v = max
    local d = max - min
    if max == 0 then
        s = 0
    else
        s = d / max
    end
    if max == min then
        h = 0
    else
        if max == r then
            h = (g - b) / d
            if g < b then h = h + 6 end
        elseif max == g then
            h = (b - r) / d + 2
        elseif max == b then
            h = (r - g) / d + 4
        end
        h = h / 6
    end
    return h, s, v
end

function Utility:HSVToColor(h, s, v)
    local r, g, b
    local i = math.floor(h * 6)
    local f = h * 6 - i
    local p = v * (1 - s)
    local q = v * (1 - f * s)
    local t = v * (1 - (1 - f) * s)
    i = i % 6
    if i == 0 then r, g, b = v, t, p
    elseif i == 1 then r, g, b = q, v, p
    elseif i == 2 then r, g, b = p, v, t
    elseif i == 3 then r, g, b = p, q, v
    elseif i == 4 then r, g, b = t, p, v
    elseif i == 5 then r, g, b = v, p, q
    end
    return Color3.fromRGB(math.floor(r * 255), math.floor(g * 255), math.floor(b * 255))
end

-- =============================================
-- RADIO MANAGER
-- =============================================

local RadioManager = {}
local radioGroups = {}

function RadioManager:Register(radio)
    local group = radio.Group or "default"
    if not radioGroups[group] then
        radioGroups[group] = {}
    end
    table.insert(radioGroups[group], radio)
end

function RadioManager:NotifyGroupChange(group, radio)
    if radio:GetValue() and radioGroups[group] then
        for _, otherRadio in ipairs(radioGroups[group]) do
            if otherRadio ~= radio and otherRadio:GetValue() then
                otherRadio:SetValue(false)
            end
        end
    end
end

-- =============================================
-- MAIN WINDOW
-- =============================================

function Linoria:CreateWindow(options)
    options = options or {}
    local title = options.Title or "Linoria UI"
    local size = options.Size or UDim2.new(0, 500, 0, 400)
    local position = options.Position or UDim2.new(0.5, -250, 0.5, -200)
    local draggable = options.Draggable ~= nil and options.Draggable or true
    local theme = options.Theme or {}

    -- Merge theme
    for k, v in pairs(theme) do
        Utility.Colors[k] = v
    end

    -- Create main screen GUI
    local screenGui = Instance.new("ScreenGui")
    screenGui.Name = "LinoriaUI"
    screenGui.ResetOnSpawn = false
    screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling

    -- Parent to PlayerGui (handle both studio and live game)
    local success, player = pcall(function()
        return game:GetService("Players").LocalPlayer
    end)

    if success and player then
        local playerGui = player:FindFirstChild("PlayerGui")
        if playerGui then
            screenGui.Parent = playerGui
        else
            player:WaitForChild("PlayerGui"):GetPropertyChangedSignal("Parent"):Wait()
            if player.PlayerGui then
                screenGui.Parent = player.PlayerGui
            end
        end
    else
        -- Running in Studio without a LocalPlayer, parent to game.StarterGui or just warn
        warn("Linoria UI: Could not find LocalPlayer. UI will not be visible in Play Solo. Use a LocalScript in StarterGui or PlayerGui.")
        -- For testing in Studio, we can parent to game:GetService("CoreGui") as fallback
        local coreGui = game:FindService("CoreGui")
        if coreGui then
            screenGui.Parent = coreGui
        else
            return nil
        end
    end

    -- Mobile support
    if game:GetService("GuiService").IsTenFootInterface then
        screenGui.IgnoreGuiInset = true
    end

    -- Main window frame
    local mainFrame = Utility:Create("Frame", {
        Name = "MainWindow",
        Parent = screenGui,
        BackgroundColor3 = Utility.Colors.Background,
        BorderColor3 = Utility.Colors.Border,
        BorderSizePixel = 1,
        Size = size,
        Position = position,
        ClipsDescendants = true,
    })

    Utility:Create("UICorner", {
        Parent = mainFrame,
        CornerRadius = UDim.new(0, 8),
    })

    -- Title bar
    local titleBar = Utility:Create("Frame", {
        Name = "TitleBar",
        Parent = mainFrame,
        BackgroundColor3 = Utility.Colors.BackgroundLight,
        BorderSizePixel = 0,
        Size = UDim2.new(1, 0, 0, 30),
    })

    Utility:Create("UICorner", {
        Parent = titleBar,
        CornerRadius = UDim.new(0, 8),
    })

    local titleLabel = Utility:Create("TextLabel", {
        Name = "TitleLabel",
        Parent = titleBar,
        BackgroundTransparency = 1,
        Position = UDim2.new(0, 12, 0, 0),
        Size = UDim2.new(1, -24, 1, 0),
        Text = title,
        TextColor3 = Utility.Colors.Text,
        Font = Enum.Font.GothamBold,
        TextSize = 14,
        TextXAlignment = Enum.TextXAlignment.Left,
    })

    -- Close button
    local closeBtn = Utility:Create("TextButton", {
        Name = "CloseButton",
        Parent = titleBar,
        BackgroundColor3 = Color3.fromRGB(200, 50, 50),
        BorderSizePixel = 0,
        Position = UDim2.new(1, -24, 0, 6),
        Size = UDim2.new(0, 18, 0, 18),
        Text = "X",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        Font = Enum.Font.GothamBold,
        TextSize = 12,
    })

    Utility:Create("UICorner", {
        Parent = closeBtn,
        CornerRadius = UDim.new(1, 0),
    })

    closeBtn.MouseButton1Click:Connect(function()
        mainFrame.Visible = false
    end)

    -- Tab bar
    local tabBar = Utility:Create("Frame", {
        Name = "TabBar",
        Parent = mainFrame,
        BackgroundColor3 = Utility.Colors.TabBackground,
        BorderSizePixel = 0,
        Position = UDim2.new(0, 0, 0, 30),
        Size = UDim2.new(1, 0, 0, 30),
    })

    local tabBarLayout = Utility:Create("UIListLayout", {
        Parent = tabBar,
        FillDirection = Enum.FillDirection.Horizontal,
        SortOrder = Enum.SortOrder.LayoutOrder,
        Padding = UDim.new(0, 0),
    })

    -- Content area
    local contentArea = Utility:Create("Frame", {
        Name = "ContentArea",
        Parent = mainFrame,
        BackgroundTransparency = 1,
        Position = UDim2.new(0, 0, 0, 60),
        Size = UDim2.new(1, 0, 1, -60),
    })

    -- Tabs storage
    local tabs = {}
    local tabButtons = {}
    local currentTab = nil

    -- Dragging functionality
    if draggable then
        local dragging = false
        local dragInput, mousePos, framePos

        titleBar.InputBegan:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
                dragging = true
                mousePos = input.Position
                framePos = mainFrame.Position

                input.Changed:Connect(function()
                    if input.UserInputState == Enum.UserInputState.End then
                        dragging = false
                    end
                end)
            end
        end)

        titleBar.InputChanged:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch then
                dragInput = input
            end
        end)

        UserInputService.InputChanged:Connect(function(input)
            if input == dragInput and dragging then
                local delta = input.Position - mousePos
                mainFrame.Position = UDim2.new(
                    framePos.X.Scale,
                    framePos.X.Offset + delta.X,
                    framePos.Y.Scale,
                    framePos.Y.Offset + delta.Y
                )
            end
        end)
    end

    -- =============================================
    -- TAB PROTOTYPE
    -- =============================================

    local Tab = {}
    Tab.__index = Tab

    function Tab:AddColumn(columnCount)
        columnCount = math.clamp(columnCount or 1, 1, 4)
        self.ColumnCount = columnCount

        -- Clear existing columns
        for _, col in ipairs(self.Columns) do
            if col.Frame then
                col.Frame:Destroy()
            end
        end
        self.Columns = {}

        for i = 1, columnCount do
            local columnFrame = Utility:Create("Frame", {
                Name = "Column_" .. i,
                Parent = self.Content,
                BackgroundTransparency = 1,
                Size = UDim2.new(1 / columnCount, 0, 1, 0),
            })

            local columnLayout = Utility:Create("UIListLayout", {
                Parent = columnFrame,
                SortOrder = Enum.SortOrder.LayoutOrder,
                Padding = UDim.new(0, 8),
            })

            local columnPadding = Utility:Create("UIPadding", {
                Parent = columnFrame,
                PaddingTop = UDim.new(0, 4),
                PaddingBottom = UDim.new(0, 4),
                PaddingLeft = UDim.new(0, 4),
                PaddingRight = UDim.new(0, 4),
            })

            local columnData = {
                Frame = columnFrame,
                Elements = {},
            }

            table.insert(self.Columns, columnData)
        end

        return self
    end

    function Tab:AddElement(element, columnIndex)
        columnIndex = columnIndex or 1
        if #self.Columns == 0 then
            self:AddColumn(1)
        end
        columnIndex = math.clamp(columnIndex, 1, #self.Columns)

        local column = self.Columns[columnIndex]
        if element.Frame then
            element.Frame.Parent = column.Frame
        else
            element.Parent = column.Frame
        end

        table.insert(column.Elements, element)

        -- Auto update canvas size
        self:UpdateCanvasSize()

        return element
    end

    function Tab:UpdateCanvasSize()
        task.wait() -- Wait for layout to update
        local totalHeight = 0
        for _, col in ipairs(self.Columns) do
            local colHeight = 0
            for _, child in ipairs(col.Frame:GetChildren()) do
                if child:IsA("GuiObject") and not child:IsA("UIListLayout") and not child:IsA("UIPadding") then
                    colHeight = colHeight + child.AbsoluteSize.Y + 8
                end
            end
            if colHeight > totalHeight then
                totalHeight = colHeight
            end
        end
        self.Content.CanvasSize = UDim2.new(0, 0, 0, totalHeight + 16)
    end

    -- =============================================
    -- ELEMENT CREATORS
    -- =============================================

    function Tab:AddToggle(options)
        options = options or {}
        local text = options.Text or "Toggle"
        local default = options.Default or false
        local callback = options.Callback or function() end

        local toggleFrame = Utility:Create("Frame", {
            Name = "Toggle_" .. text,
            Parent = nil, -- Will be set by AddElement
            BackgroundColor3 = Utility.Colors.BackgroundLight,
            BorderColor3 = Utility.Colors.Border,
            BorderSizePixel = 1,
            Size = UDim2.new(1, 0, 0, 30),
            LayoutOrder = #self.Columns[1].Elements,
        })

        Utility:Create("UICorner", {
            Parent = toggleFrame,
            CornerRadius = UDim.new(0, 4),
        })

        local toggleButton = Utility:Create("Frame", {
            Name = "ToggleIndicator",
            Parent = toggleFrame,
            BackgroundColor3 = default and Utility.Colors.Accent or Utility.Colors.Border,
            BorderSizePixel = 0,
            Position = UDim2.new(0, 6, 0.5, -6),
            Size = UDim2.new(0, 18, 0, 12),
        })

        Utility:Create("UICorner", {
            Parent = toggleButton,
            CornerRadius = UDim.new(1, 0),
        })

        local toggleKnob = Utility:Create("Frame", {
            Name = "ToggleKnob",
            Parent = toggleButton,
            BackgroundColor3 = Color3.fromRGB(255, 255, 255),
            BorderSizePixel = 0,
            Position = UDim2.new(0, default and 7 or 1, 0.5, -4),
            Size = UDim2.new(0, 10, 0, 10),
        })

        Utility:Create("UICorner", {
            Parent = toggleKnob,
            CornerRadius = UDim.new(1, 0),
        })

        local toggleLabel = Utility:Create("TextLabel", {
            Name = "ToggleLabel",
            Parent = toggleFrame,
            BackgroundTransparency = 1,
            Position = UDim2.new(0, 32, 0, 0),
            Size = UDim2.new(1, -36, 1, 0),
            Text = text,
            TextColor3 = Utility.Colors.Text,
            Font = Enum.Font.Gotham,
            TextSize = 13,
            TextXAlignment = Enum.TextXAlignment.Left,
        })

        local toggleData = {
            Frame = toggleFrame,
            Value = default,
            Callback = callback,
            Indicator = toggleButton,
            Knob = toggleKnob,
            Label = toggleLabel,
        }

        local function updateVisual()
            local targetX = toggleData.Value and 7 or 1
            local tween = Utility:CreateTween(toggleKnob, {Position = UDim2.new(0, targetX, 0.5, -4)}, 0.15)
            tween:Play()
            toggleButton.BackgroundColor3 = toggleData.Value and Utility.Colors.Accent or Utility.Colors.Border
        end

        toggleFrame.InputBegan:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
                toggleData.Value = not toggleData.Value
                updateVisual()
                callback(toggleData.Value)
            end
        end)

        -- API
        function toggleData:SetValue(value)
            self.Value = value
            updateVisual()
            self.Callback(self.Value)
        end

        function toggleData:GetValue()
            return self.Value
        end

        function toggleData:SetText(newText)
            self.Label.Text = newText
        end

        function toggleData:SetVisible(visible)
            self.Frame.Visible = visible
        end

        function toggleData:IsVisible()
            return self.Frame.Visible
        end

        updateVisual()
        return self:AddElement(toggleData)
    end

    function Tab:AddDropdown(options)
        options = options or {}
        local text = options.Text or "Dropdown"
        local items = options.Items or {}
        local default = options.Default or items[1] or ""
        local callback = options.Callback or function() end

        -- Container frame
        local dropdownContainer = Utility:Create("Frame", {
            Name = "Dropdown_" .. text,
            Parent = nil,
            BackgroundTransparency = 1,
            Size = UDim2.new(1, 0, 0, 55),
            LayoutOrder = #self.Columns[1].Elements,
        })

        -- Label
        local dropdownLabel = Utility:Create("TextLabel", {
            Name = "DropdownLabel",
            Parent = dropdownContainer,
            BackgroundTransparency = 1,
            Size = UDim2.new(1, 0, 0, 16),
            Text = text,
            TextColor3 = Utility.Colors.Text,
            Font = Enum.Font.Gotham,
            TextSize = 13,
            TextXAlignment = Enum.TextXAlignment.Left,
        })

        -- Dropdown button
        local dropdownBtn = Utility:Create("TextButton", {
            Name = "DropdownButton",
            Parent = dropdownContainer,
            BackgroundColor3 = Utility.Colors.BackgroundLight,
            BorderColor3 = Utility.Colors.Border,
            BorderSizePixel = 1,
            Position = UDim2.new(0, 0, 0, 20),
            Size = UDim2.new(1, 0, 0, 28),
            Text = default,
            TextColor3 = Utility.Colors.Text,
            Font = Enum.Font.Gotham,
            TextSize = 13,
            AutoButtonColor = false,
        })

        Utility:Create("UICorner", {
            Parent = dropdownBtn,
            CornerRadius = UDim.new(0, 4),
        })

        -- Arrow indicator
        local arrowLabel = Utility:Create("TextLabel", {
            Name = "ArrowLabel",
            Parent = dropdownBtn,
            BackgroundTransparency = 1,
            Position = UDim2.new(1, -20, 0, 0),
            Size = UDim2.new(0, 20, 1, 0),
            Text = "▼",
            TextColor3 = Utility.Colors.Placeholder,
            Font = Enum.Font.Gotham,
            TextSize = 10,
        })

        -- Dropdown list
        local dropdownList = Utility:Create("ScrollingFrame", {
            Name = "DropdownList",
            Parent = dropdownContainer,
            BackgroundColor3 = Utility.Colors.BackgroundLight,
            BorderColor3 = Utility.Colors.Border,
            BorderSizePixel = 1,
            Position = UDim2.new(0, 0, 0, 48),
            Size = UDim2.new(1, 0, 0, 0),
            Visible = false,
            ScrollBarThickness = 4,
            ScrollBarImageColor3 = Utility.Colors.ScrollBar,
            CanvasSize = UDim2.new(0, 0, 0, 0),
        })

        Utility:Create("UICorner", {
            Parent = dropdownList,
            CornerRadius = UDim.new(0, 4),
        })

        local listLayout = Utility:Create("UIListLayout", {
            Parent = dropdownList,
            SortOrder = Enum.SortOrder.LayoutOrder,
            Padding = UDim.new(0, 2),
        })

        local listPadding = Utility:Create("UIPadding", {
            Parent = dropdownList,
            PaddingTop = UDim.new(0, 4),
            PaddingBottom = UDim.new(0, 4),
            PaddingLeft = UDim.new(0, 4),
            PaddingRight = UDim.new(0, 4),
        })

        local dropdownData = {
            Frame = dropdownContainer,
            Button = dropdownBtn,
            List = dropdownList,
            Arrow = arrowLabel,
            Items = items,
            Selected = default,
            Callback = callback,
            IsOpen = false,
        }

        local function populateList()
            -- Clear existing items
            for _, child in ipairs(dropdownList:GetChildren()) do
                if child:IsA("TextButton") then
                    child:Destroy()
                end
            end

            for i, item in ipairs(items) do
                local itemBtn = Utility:Create("TextButton", {
                    Name = "Item_" .. i,
                    Parent = dropdownList,
                    BackgroundColor3 = item == dropdownData.Selected and Utility.Colors.Accent or Utility.Colors.Background,
                    BorderSizePixel = 0,
                    Size = UDim2.new(1, 0, 0, 24),
                    Text = item,
                    TextColor3 = item == dropdownData.Selected and Color3.fromRGB(255, 255, 255) or Utility.Colors.Text,
                    Font = Enum.Font.Gotham,
                    TextSize = 12,
                    AutoButtonColor = false,
                    LayoutOrder = i,
                })

                Utility:Create("UICorner", {
                    Parent = itemBtn,
                    CornerRadius = UDim.new(0, 3),
                })

                itemBtn.MouseButton1Click:Connect(function()
                    dropdownData.Selected = item
                    dropdownBtn.Text = item
                    dropdownData:Close()
                    callback(item)
                end)

                itemBtn.MouseEnter:Connect(function()
                    if item ~= dropdownData.Selected then
                        itemBtn.BackgroundColor3 = Utility.Colors.HoverBackground
                    end
                end)

                itemBtn.MouseLeave:Connect(function()
                    if item ~= dropdownData.Selected then
                        itemBtn.BackgroundColor3 = Utility.Colors.Background
                    end
                end)
            end

            dropdownList.CanvasSize = UDim2.new(0, 0, 0, #items * 26 + 8)
        end

        function dropdownData:Open()
            self.IsOpen = true
            self.List.Visible = true
            self.Arrow.Text = "▲"
            dropdownContainer.Size = UDim2.new(1, 0, 0, 48 + math.min(#self.Items * 26 + 8, 150))
        end

        function dropdownData:Close()
            self.IsOpen = false
            self.List.Visible = false
            self.Arrow.Text = "▼"
            dropdownContainer.Size = UDim2.new(1, 0, 0, 55)
        end

        function dropdownData:Toggle()
            if self.IsOpen then
                self:Close()
            else
                self:Open()
            end
        end

        dropdownBtn.MouseButton1Click:Connect(function()
            dropdownData:Toggle()
        end)

        -- Close when clicking outside
        UserInputService.InputBegan:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
                if dropdownData.IsOpen then
                    local mousePos = input.Position
                    local btnPos = dropdownBtn.AbsolutePosition
                    local btnSize = dropdownBtn.AbsoluteSize
                    local listPos = dropdownList.AbsolutePosition
                    local listSize = dropdownList.AbsoluteSize

                    local onBtn = (mousePos.X >= btnPos.X and mousePos.X <= btnPos.X + btnSize.X and
                                   mousePos.Y >= btnPos.Y and mousePos.Y <= btnPos.Y + btnSize.Y)
                    local onList = (mousePos.X >= listPos.X and mousePos.X <= listPos.X + listSize.X and
                                    mousePos.Y >= listPos.Y and mousePos.Y <= listPos.Y + listSize.Y)

                    if not onBtn and not onList then
                        dropdownData:Close()
                    end
                end
            end
        end)

        populateList()

        -- API
        function dropdownData:SetItems(newItems)
            self.Items = newItems
            if not table.find(newItems, self.Selected) then
                self.Selected = newItems[1] or ""
                dropdownBtn.Text = self.Selected
            end
            populateList()
        end

        function dropdownData:GetSelected()
            return self.Selected
        end

        function dropdownData:SetSelected(item)
            if table.find(self.Items, item) then
                self.Selected = item
                dropdownBtn.Text = item
                callback(item)
                populateList()
            end
        end

        function dropdownData:SetVisible(visible)
            self.Frame.Visible = visible
        end

        function dropdownData:IsVisible()
            return self.Frame.Visible
        end

        return self:AddElement(dropdownData)
    end

    function Tab:AddRadio(options)
        options = options or {}
        local text = options.Text or "Radio"
        local group = options.Group or "default"
        local default = options.Default or false
        local callback = options.Callback or function() end

        local radioFrame = Utility:Create("Frame", {
            Name = "Radio_" .. text,
            Parent = nil,
            BackgroundColor3 = Utility.Colors.BackgroundLight,
            BorderColor3 = Utility.Colors.Border,
            BorderSizePixel = 1,
            Size = UDim2.new(1, 0, 0, 30),
            LayoutOrder = #self.Columns[1].Elements,
        })

        Utility:Create("UICorner", {
            Parent = radioFrame,
            CornerRadius = UDim.new(0, 4),
        })

        local radioCircle = Utility:Create("Frame", {
            Name = "RadioCircle",
            Parent = radioFrame,
            BackgroundColor3 = Utility.Colors.Background,
            BorderColor3 = Utility.Colors.Border,
            BorderSizePixel = 1,
            Position = UDim2.new(0, 6, 0.5, -6),
            Size = UDim2.new(0, 12, 0, 12),
        })

        Utility:Create("UICorner", {
            Parent = radioCircle,
            CornerRadius = UDim.new(1, 0),
        })

        local radioInner = Utility:Create("Frame", {
            Name = "RadioInner",
            Parent = radioCircle,
            BackgroundColor3 = Utility.Colors.Accent,
            BorderSizePixel = 0,
            Position = UDim2.new(0.5, -3, 0.5, -3),
            Size = UDim2.new(0, 6, 0, 6),
            Visible = default,
        })

        Utility:Create("UICorner", {
            Parent = radioInner,
            CornerRadius = UDim.new(1, 0),
        })

        local radioLabel = Utility:Create("TextLabel", {
            Name = "RadioLabel",
            Parent = radioFrame,
            BackgroundTransparency = 1,
            Position = UDim2.new(0, 26, 0, 0),
            Size = UDim2.new(1, -30, 1, 0),
            Text = text,
            TextColor3 = Utility.Colors.Text,
            Font = Enum.Font.Gotham,
            TextSize = 13,
            TextXAlignment = Enum.TextXAlignment.Left,
        })

        local radioData = {
            Frame = radioFrame,
            Value = default,
            Group = group,
            Callback = callback,
            Circle = radioCircle,
            Inner = radioInner,
            Label = radioLabel,
        }

        local function updateVisual()
            radioInner.Visible = radioData.Value
            radioCircle.BorderColor3 = radioData.Value and Utility.Colors.Accent or Utility.Colors.Border
        end

        radioFrame.InputBegan:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
                radioData:SetValue(true)
            end
        end)

        -- Register with radio manager
        RadioManager:Register(radioData)

        -- API
        function radioData:SetValue(value)
            self.Value = value ~= false
            updateVisual()
            if self.Value then
                RadioManager:NotifyGroupChange(self.Group, self)
            end
            self.Callback(self.Value)
        end

        function radioData:GetValue()
            return self.Value
        end

        function radioData:SetText(newText)
            self.Label.Text = newText
        end

        function radioData:SetGroup(newGroup)
            self.Group = newGroup
        end

        function radioData:SetVisible(visible)
            self.Frame.Visible = visible
        end

        function radioData:IsVisible()
            return self.Frame.Visible
        end

        updateVisual()
        return self:AddElement(radioData)
    end

    function Tab:AddColorpicker(options)
        options = options or {}
        local text = options.Text or "Colorpicker"
        local default = options.Default or Color3.fromRGB(255, 255, 255)
        local callback = options.Callback or function() end

        -- Container
        local colorContainer = Utility:Create("Frame", {
            Name = "Colorpicker_" .. text,
            Parent = nil,
            BackgroundTransparency = 1,
            Size = UDim2.new(1, 0, 0, 30),
            LayoutOrder = #self.Columns[1].Elements,
        })

        -- Label
        local colorLabel = Utility:Create("TextLabel", {
            Name = "ColorLabel",
            Parent = colorContainer,
            BackgroundTransparency = 1,
            Size = UDim2.new(1, -40, 1, 0),
            Text = text,
            TextColor3 = Utility.Colors.Text,
            Font = Enum.Font.Gotham,
            TextSize = 13,
            TextXAlignment = Enum.TextXAlignment.Left,
        })

        -- Color preview button
        local colorPreview = Utility:Create("TextButton", {
            Name = "ColorPreview",
            Parent = colorContainer,
            BackgroundColor3 = default,
            BorderColor3 = Utility.Colors.Border,
            BorderSizePixel = 1,
            Position = UDim2.new(1, -32, 0.5, -10),
            Size = UDim2.new(0, 24, 0, 20),
            Text = "",
            AutoButtonColor = false,
        })

        Utility:Create("UICorner", {
            Parent = colorPreview,
            CornerRadius = UDim.new(0, 4),
        })

        -- Colorpicker popup
        local colorPopup = Utility:Create("Frame", {
            Name = "ColorPopup",
            Parent = screenGui,
            BackgroundColor3 = Utility.Colors.ColorpickerBackground,
            BorderColor3 = Utility.Colors.ColorpickerBorder,
            BorderSizePixel = 1,
            Size = UDim2.new(0, 220, 0, 280),
            Visible = false,
            ZIndex = 10,
        })

        Utility:Create("UICorner", {
            Parent = colorPopup,
            CornerRadius = UDim.new(0, 8),
        })

        Utility:Create("UIPadding", {
            Parent = colorPopup,
            PaddingTop = UDim.new(0, 8),
            PaddingBottom = UDim.new(0, 8),
            PaddingLeft = UDim.new(0, 8),
            PaddingRight = UDim.new(0, 8),
        })

        -- Saturation/Value picker
        local svPicker = Utility:Create("ImageLabel", {
            Name = "SVPicker",
            Parent = colorPopup,
            BackgroundColor3 = default,
            BorderColor3 = Utility.Colors.Border,
            BorderSizePixel = 1,
            Position = UDim2.new(0, 8, 0, 8),
            Size = UDim2.new(0, 200, 0, 150),
            Image = "rbxassetid://4155801252", -- White gradient
            ZIndex = 11,
        })

        Utility:Create("UICorner", {
            Parent = svPicker,
            CornerRadius = UDim.new(0, 4),
        })

        local svOverlay = Utility:Create("ImageLabel", {
            Name = "SVOverlay",
            Parent = svPicker,
            BackgroundTransparency = 1,
            Size = UDim2.new(1, 0, 1, 0),
            Image = "rbxassetid://4155801252", -- Black gradient
            ImageColor3 = Color3.fromRGB(0, 0, 0),
            ZIndex = 12,
        })

        -- SV indicator
        local svIndicator = Utility:Create("Frame", {
            Name = "SVIndicator",
            Parent = svPicker,
            BackgroundColor3 = Color3.fromRGB(255, 255, 255),
            BorderColor3 = Color3.fromRGB(0, 0, 0),
            BorderSizePixel = 1,
            Position = UDim2.new(1, -4, 0, -4),
            Size = UDim2.new(0, 8, 0, 8),
            ZIndex = 13,
        })

        Utility:Create("UICorner", {
            Parent = svIndicator,
            CornerRadius = UDim.new(1, 0),
        })

        -- Hue slider
        local hueSlider = Utility:Create("Frame", {
            Name = "HueSlider",
            Parent = colorPopup,
            BackgroundColor3 = Color3.fromRGB(255, 0, 0),
            BorderColor3 = Utility.Colors.Border,
            BorderSizePixel = 1,
            Position = UDim2.new(0, 8, 0, 166),
            Size = UDim2.new(1, -16, 0, 12),
            ZIndex = 11,
        })

        Utility:Create("UICorner", {
            Parent = hueSlider,
            CornerRadius = UDim.new(1, 0),
        })

        -- Hue gradient (rainbow)
        local hueGradient = Utility:Create("UIGradient", {
            Parent = hueSlider,
            Color = ColorSequence.new({
                ColorSequenceKeypoint.new(0.00, Color3.fromRGB(255, 0, 0)),
                ColorSequenceKeypoint.new(0.17, Color3.fromRGB(255, 255, 0)),
                ColorSequenceKeypoint.new(0.33, Color3.fromRGB(0, 255, 0)),
                ColorSequenceKeypoint.new(0.50, Color3.fromRGB(0, 255, 255)),
                ColorSequenceKeypoint.new(0.67, Color3.fromRGB(0, 0, 255)),
                ColorSequenceKeypoint.new(0.83, Color3.fromRGB(255, 0, 255)),
                ColorSequenceKeypoint.new(1.00, Color3.fromRGB(255, 0, 0)),
            }),
        })

        -- Hue indicator
        local hueIndicator = Utility:Create("Frame", {
            Name = "HueIndicator",
            Parent = hueSlider,
            BackgroundColor3 = Color3.fromRGB(255, 255, 255),
            BorderColor3 = Color3.fromRGB(0, 0, 0),
            BorderSizePixel = 1,
            Position = UDim2.new(0, 0, 0.5, -6),
            Size = UDim2.new(0, 4, 0, 12),
            ZIndex = 12,
        })

        Utility:Create("UICorner", {
            Parent = hueIndicator,
            CornerRadius = UDim.new(0, 2),
        })

        -- RGB Input fields
        local inputY = 188
        local inputHeight = 24
        local inputWidth = 56
        local inputSpacing = 6

        local function createInput(parent, label, x, y, value, maxVal)
            local container = Utility:Create("Frame", {
                Name = label .. "Container",
                Parent = parent,
                BackgroundTransparency = 1,
                Position = UDim2.new(0, x, 0, y),
                Size = UDim2.new(0, inputWidth, 0, inputHeight),
            })

            local lbl = Utility:Create("TextLabel", {
                Name = "Label",
                Parent = container,
                BackgroundTransparency = 1,
                Size = UDim2.new(1, 0, 0, 10),
                Text = label,
                TextColor3 = Utility.Colors.Placeholder,
                Font = Enum.Font.Gotham,
                TextSize = 10,
            })

            local txtBox = Utility:Create("TextBox", {
                Name = "Input",
                Parent = container,
                BackgroundColor3 = Utility.Colors.BackgroundLight,
                BorderColor3 = Utility.Colors.Border,
                BorderSizePixel = 1,
                Position = UDim2.new(0, 0, 0, 10),
                Size = UDim2.new(1, 0, 0, 14),
                Text = tostring(value),
                TextColor3 = Utility.Colors.Text,
                Font = Enum.Font.Gotham,
                TextSize = 11,
                ClearTextOnFocus = false,
            })

            Utility:Create("UICorner", {
                Parent = txtBox,
                CornerRadius = UDim.new(0, 3),
            })

            return txtBox
        end

        local rInput = createInput(colorPopup, "R", 8, inputY, math.floor(default.R * 255), 255)
        local gInput = createInput(colorPopup, "G", 8 + inputWidth + inputSpacing, inputY, math.floor(default.G * 255), 255)
        local bInput = createInput(colorPopup, "B", 8 + (inputWidth + inputSpacing) * 2, inputY, math.floor(default.B * 255), 255)

        -- Hex input
        local hexContainer = Utility:Create("Frame", {
            Name = "HexContainer",
            Parent = colorPopup,
            BackgroundTransparency = 1,
            Position = UDim2.new(0, 8, 0, inputY + 30),
            Size = UDim2.new(1, -16, 0, inputHeight),
        })

        local hexLabel = Utility:Create("TextLabel", {
            Name = "Label",
            Parent = hexContainer,
            BackgroundTransparency = 1,
            Size = UDim2.new(1, 0, 0, 10),
            Text = "HEX",
            TextColor3 = Utility.Colors.Placeholder,
            Font = Enum.Font.Gotham,
            TextSize = 10,
        })

        local hexInput = Utility:Create("TextBox", {
            Name = "HexInput",
            Parent = hexContainer,
            BackgroundColor3 = Utility.Colors.BackgroundLight,
            BorderColor3 = Utility.Colors.Border,
            BorderSizePixel = 1,
            Position = UDim2.new(0, 0, 0, 10),
            Size = UDim2.new(1, 0, 0, 14),
            Text = Utility:ColorToHex(default),
            TextColor3 = Utility.Colors.Text,
            Font = Enum.Font.Gotham,
            TextSize = 11,
            ClearTextOnFocus = false,
        })

        Utility:Create("UICorner", {
            Parent = hexInput,
            CornerRadius = UDim.new(0, 3),
        })

        -- Color state
        local colorState = {
            Frame = colorContainer,
            Color = default,
            Callback = callback,
            Popup = colorPopup,
            IsOpen = false,
            Hue = 0,
            Saturation = 1,
            Value = 1,
        }

        -- Initialize HSV
        colorState.Hue, colorState.Saturation, colorState.Value = Utility:ColorToHSV(default)

        local function updateColor(newColor)
            colorState.Color = newColor
            colorPreview.BackgroundColor3 = newColor
            svPicker.BackgroundColor3 = Utility:HSVToColor(colorState.Hue, 1, 1)

            -- Update inputs
            local r, g, b = Utility:ColorToRGB(newColor)
            rInput.Text = tostring(r)
            gInput.Text = tostring(g)
            bInput.Text = tostring(b)
            hexInput.Text = Utility:ColorToHex(newColor)

            -- Update SV indicator position
            svIndicator.Position = UDim2.new(colorState.Saturation, -4, 1 - colorState.Value, -4)

            -- Update hue indicator position
            hueIndicator.Position = UDim2.new(colorState.Hue, -2, 0.5, -6)

            callback(newColor)
        end

        -- SV Picker interaction
        local svDragging = false
        svPicker.InputBegan:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
                svDragging = true
            end
        end)

        svPicker.InputEnded:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
                svDragging = false
            end
        end)

        UserInputService.InputChanged:Connect(function(input)
            if svDragging and (input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch) then
                local relativeX = (input.Position.X - svPicker.AbsolutePosition.X) / svPicker.AbsoluteSize.X
                local relativeY = (input.Position.Y - svPicker.AbsolutePosition.Y) / svPicker.AbsoluteSize.Y
                colorState.Saturation = math.clamp(relativeX, 0, 1)
                colorState.Value = math.clamp(1 - relativeY, 0, 1)
                updateColor(Utility:HSVToColor(colorState.Hue, colorState.Saturation, colorState.Value))
            end
        end)

        -- Hue slider interaction
        local hueDragging = false
        hueSlider.InputBegan:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
                hueDragging = true
            end
        end)

        hueSlider.InputEnded:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
                hueDragging = false
            end
        end)

        UserInputService.InputChanged:Connect(function(input)
            if hueDragging and (input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch) then
                local relativeX = (input.Position.X - hueSlider.AbsolutePosition.X) / hueSlider.AbsoluteSize.X
                colorState.Hue = math.clamp(relativeX, 0, 1)
                updateColor(Utility:HSVToColor(colorState.Hue, colorState.Saturation, colorState.Value))
            end
        end)

        -- RGB input handlers
        local function onRGBInputChanged(inputBox, channel)
            inputBox.FocusLost:Connect(function()
                local val = tonumber(inputBox.Text)
                if val then
                    val = math.clamp(val, 0, 255)
                    inputBox.Text = tostring(val)
                    local r, g, b = Utility:ColorToRGB(colorState.Color)
                    if channel == "R" then r = val elseif channel == "G" then g = val elseif channel == "B" then b = val end
                    local newColor = Utility:RGBToColor(r, g, b)
                    colorState.Hue, colorState.Saturation, colorState.Value = Utility:ColorToHSV(newColor)
                    updateColor(newColor)
                else
                    local r, g, b = Utility:ColorToRGB(colorState.Color)
                    if channel == "R" then inputBox.Text = tostring(r)
                    elseif channel == "G" then inputBox.Text = tostring(g)
                    elseif channel == "B" then inputBox.Text = tostring(b)
                    end
                end
            end)
        end

        onRGBInputChanged(rInput, "R")
        onRGBInputChanged(gInput, "G")
        onRGBInputChanged(bInput, "B")

        -- Hex input handler
        hexInput.FocusLost:Connect(function()
            local hex = hexInput.Text
            if hex:match("^#?[0-9a-fA-F]+$") and #hex:gsub("#", "") == 6 then
                local newColor = Utility:HexToColor(hex)
                colorState.Hue, colorState.Saturation, colorState.Value = Utility:ColorToHSV(newColor)
                updateColor(newColor)
            else
                hexInput.Text = Utility:ColorToHex(colorState.Color)
            end
        end)

        -- Toggle popup
        colorPreview.MouseButton1Click:Connect(function()
            if colorState.IsOpen then
                colorState:Close()
            else
                colorState:Open()
            end
        end)

        function colorState:Open()
            self.IsOpen = true
            -- Position popup near the preview button
            local previewPos = colorPreview.AbsolutePosition
            local previewSize = colorPreview.AbsoluteSize
            colorPopup.Position = UDim2.new(0, previewPos.X - 100, 0, previewPos.Y - 290)
            colorPopup.Visible = true
        end

        function colorState:Close()
            self.IsOpen = false
            colorPopup.Visible = false
        end

        function colorState:SetColor(color)
            self.Color = color
            self.Hue, self.Saturation, self.Value = Utility:ColorToHSV(color)
            updateColor(color)
        end

        function colorState:GetColor()
            return self.Color
        end

        function colorState:SetVisible(visible)
            self.Frame.Visible = visible
        end

        function colorState:IsVisible()
            return self.Frame.Visible
        end

        -- Close popup when clicking outside
        UserInputService.InputBegan:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
                if colorState.IsOpen then
                    local mousePos = input.Position
                    local popupPos = colorPopup.AbsolutePosition
                    local popupSize = colorPopup.AbsoluteSize
                    local previewPos = colorPreview.AbsolutePosition
                    local previewSize = colorPreview.AbsoluteSize

                    local onPopup = (mousePos.X >= popupPos.X and mousePos.X <= popupPos.X + popupSize.X and
                                     mousePos.Y >= popupPos.Y and mousePos.Y <= popupPos.Y + popupSize.Y)
                    local onPreview = (mousePos.X >= previewPos.X and mousePos.X <= previewPos.X + previewSize.X and
                                       mousePos.Y >= previewPos.Y and mousePos.Y <= previewPos.Y + previewSize.Y)

                    if not onPopup and not onPreview then
                        colorState:Close()
                    end
                end
            end
        end)

        updateColor(default)
        return self:AddElement(colorState)
    end

    function Tab:AddTextbox(options)
        options = options or {}
        local text = options.Text or "Textbox"
        local default = options.Default or ""
        local placeholder = options.Placeholder or "Enter text..."
        local callback = options.Callback or function() end

        local textContainer = Utility:Create("Frame", {
            Name = "Textbox_" .. text,
            Parent = nil,
            BackgroundTransparency = 1,
            Size = UDim2.new(1, 0, 0, 55),
            LayoutOrder = #self.Columns[1].Elements,
        })

        local textLabel = Utility:Create("TextLabel", {
            Name = "TextLabel",
            Parent = textContainer,
            BackgroundTransparency = 1,
            Size = UDim2.new(1, 0, 0, 16),
            Text = text,
            TextColor3 = Utility.Colors.Text,
            Font = Enum.Font.Gotham,
            TextSize = 13,
            TextXAlignment = Enum.TextXAlignment.Left,
        })

        local textBox = Utility:Create("TextBox", {
            Name = "InputBox",
            Parent = textContainer,
            BackgroundColor3 = Utility.Colors.BackgroundLight,
            BorderColor3 = Utility.Colors.Border,
            BorderSizePixel = 1,
            Position = UDim2.new(0, 0, 0, 20),
            Size = UDim2.new(1, 0, 0, 28),
            Text = default,
            PlaceholderText = placeholder,
            TextColor3 = Utility.Colors.Text,
            PlaceholderColor3 = Utility.Colors.Placeholder,
            Font = Enum.Font.Gotham,
            TextSize = 13,
            ClearTextOnFocus = false,
        })

        Utility:Create("UICorner", {
            Parent = textBox,
            CornerRadius = UDim.new(0, 4),
        })

        local textboxData = {
            Frame = textContainer,
            Text = default,
            Callback = callback,
            Input = textBox,
        }

        textBox.FocusLost:Connect(function(enterPressed)
            textboxData.Text = textBox.Text
            callback(textBox.Text, enterPressed)
        end)

        -- API
        function textboxData:GetText()
            return self.Text
        end

        function textboxData:SetText(newText)
            self.Text = newText
            self.Input.Text = newText
        end

        function textboxData:SetPlaceholder(newPlaceholder)
            self.Input.PlaceholderText = newPlaceholder
        end

        function textboxData:SetVisible(visible)
            self.Frame.Visible = visible
        end

        function textboxData:IsVisible()
            return self.Frame.Visible
        end

        return self:AddElement(textboxData)
    end

    function Tab:AddLabel(options)
        options = options or {}
        local text = options.Text or "Label"
        local textColor = options.TextColor or Utility.Colors.Text

        local labelFrame = Utility:Create("Frame", {
            Name = "Label_" .. text,
            Parent = nil,
            BackgroundTransparency = 1,
            Size = UDim2.new(1, 0, 0, 18),
            LayoutOrder = #self.Columns[1].Elements,
        })

        local label = Utility:Create("TextLabel", {
            Name = "Label",
            Parent = labelFrame,
            BackgroundTransparency = 1,
            Size = UDim2.new(1, 0, 1, 0),
            Text = text,
            TextColor3 = textColor,
            Font = Enum.Font.Gotham,
            TextSize = 13,
            TextXAlignment = Enum.TextXAlignment.Left,
        })

        local labelData = {
            Frame = labelFrame,
            Label = label,
        }

        function labelData:SetText(newText)
            self.Label.Text = newText
        end

        function labelData:SetTextColor(color)
            self.Label.TextColor3 = color
        end

        function labelData:SetVisible(visible)
            self.Frame.Visible = visible
        end

        function labelData:IsVisible()
            return self.Frame.Visible
        end

        return self:AddElement(labelData)
    end

    function Tab:AddButton(options)
        options = options or {}
        local text = options.Text or "Button"
        local callback = options.Callback or function() end

        local btnFrame = Utility:Create("Frame", {
            Name = "Button_" .. text,
            Parent = nil,
            BackgroundTransparency = 1,
            Size = UDim2.new(1, 0, 0, 30),
            LayoutOrder = #self.Columns[1].Elements,
        })

        local button = Utility:Create("TextButton", {
            Name = "Button",
            Parent = btnFrame,
            BackgroundColor3 = Utility.Colors.Accent,
            BorderColor3 = Utility.Colors.Border,
            BorderSizePixel = 1,
            Size = UDim2.new(1, 0, 1, 0),
            Text = text,
            TextColor3 = Color3.fromRGB(255, 255, 255),
            Font = Enum.Font.GothamBold,
            TextSize = 13,
            AutoButtonColor = false,
        })

        Utility:Create("UICorner", {
            Parent = button,
            CornerRadius = UDim.new(0, 4),
        })

        button.MouseButton1Click:Connect(callback)

        local buttonData = {
            Frame = btnFrame,
            Button = button,
        }

        function buttonData:SetText(newText)
            self.Button.Text = newText
        end

        function buttonData:SetVisible(visible)
            self.Frame.Visible = visible
        end

        function buttonData:IsVisible()
            return self.Frame.Visible
        end

        return self:AddElement(buttonData)
    end

    function Tab:AddSlider(options)
        options = options or {}
        local text = options.Text or "Slider"
        local min = options.Min or 0
        local max = options.Max or 100
        local default = options.Default or 50
        local callback = options.Callback or function() end

        local sliderContainer = Utility:Create("Frame", {
            Name = "Slider_" .. text,
            Parent = nil,
            BackgroundTransparency = 1,
            Size = UDim2.new(1, 0, 0, 45),
            LayoutOrder = #self.Columns[1].Elements,
        })

        local sliderLabel = Utility:Create("TextLabel", {
            Name = "SliderLabel",
            Parent = sliderContainer,
            BackgroundTransparency = 1,
            Size = UDim2.new(1, -50, 0, 16),
            Text = text,
            TextColor3 = Utility.Colors.Text,
            Font = Enum.Font.Gotham,
            TextSize = 13,
            TextXAlignment = Enum.TextXAlignment.Left,
        })

        local sliderValue = Utility:Create("TextLabel", {
            Name = "SliderValue",
            Parent = sliderContainer,
            BackgroundTransparency = 1,
            Position = UDim2.new(1, -45, 0, 0),
            Size = UDim2.new(0, 45, 0, 16),
            Text = tostring(default),
            TextColor3 = Utility.Colors.Placeholder,
            Font = Enum.Font.Gotham,
            TextSize = 13,
            TextXAlignment = Enum.TextXAlignment.Right,
        })

        local sliderTrack = Utility:Create("Frame", {
            Name = "SliderTrack",
            Parent = sliderContainer,
            BackgroundColor3 = Utility.Colors.BackgroundLight,
            BorderColor3 = Utility.Colors.Border,
            BorderSizePixel = 1,
            Position = UDim2.new(0, 0, 0, 22),
            Size = UDim2.new(1, 0, 0, 8),
        })

        Utility:Create("UICorner", {
            Parent = sliderTrack,
            CornerRadius = UDim.new(1, 0),
        })

        local sliderFill = Utility:Create("Frame", {
            Name = "SliderFill",
            Parent = sliderTrack,
            BackgroundColor3 = Utility.Colors.Accent,
            BorderSizePixel = 0,
            Size = UDim2.new((default - min) / (max - min), 0, 1, 0),
        })

        Utility:Create("UICorner", {
            Parent = sliderFill,
            CornerRadius = UDim.new(1, 0),
        })

        local sliderKnob = Utility:Create("Frame", {
            Name = "SliderKnob",
            Parent = sliderTrack,
            BackgroundColor3 = Color3.fromRGB(255, 255, 255),
            BorderColor3 = Color3.fromRGB(0, 0, 0),
            BorderSizePixel = 1,
            Position = UDim2.new((default - min) / (max - min), -6, 0.5, -6),
            Size = UDim2.new(0, 12, 0, 12),
        })

        Utility:Create("UICorner", {
            Parent = sliderKnob,
            CornerRadius = UDim.new(1, 0),
        })

        local sliderData = {
            Frame = sliderContainer,
            Value = default,
            Min = min,
            Max = max,
            Callback = callback,
            Fill = sliderFill,
            Knob = sliderKnob,
            ValueLabel = sliderValue,
        }

        local function updateSlider(value)
            value = math.clamp(value, min, max)
            sliderData.Value = value
            local percent = (value - min) / (max - min)
            sliderFill.Size = UDim2.new(percent, 0, 1, 0)
            sliderKnob.Position = UDim2.new(percent, -6, 0.5, -6)
            sliderValue.Text = tostring(math.floor(value))
            callback(value)
        end

        local dragging = false
        sliderTrack.InputBegan:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
                dragging = true
            end
        end)

        sliderTrack.InputEnded:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
                dragging = false
            end
        end)

        UserInputService.InputChanged:Connect(function(input)
            if dragging and (input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch) then
                local relativeX = (input.Position.X - sliderTrack.AbsolutePosition.X) / sliderTrack.AbsoluteSize.X
                local value = min + (max - min) * math.clamp(relativeX, 0, 1)
                updateSlider(value)
            end
        end)

        -- API
        function sliderData:SetValue(value)
            updateSlider(value)
        end

        function sliderData:GetValue()
            return self.Value
        end

        function sliderData:SetMin(newMin)
            self.Min = newMin
            updateSlider(self.Value)
        end

        function sliderData:SetMax(newMax)
            self.Max = newMax
            updateSlider(self.Value)
        end

        function sliderData:SetVisible(visible)
            self.Frame.Visible = visible
        end

        function sliderData:IsVisible()
            return self.Frame.Visible
        end

        updateSlider(default)
        return self:AddElement(sliderData)
    end

    function Tab:AddSection(options)
        options = options or {}
        local text = options.Text or "Section"
        local style = options.Style or "default" -- default, box, line

        local sectionFrame = Utility:Create("Frame", {
            Name = "Section_" .. text,
            Parent = nil,
            BackgroundTransparency = 1,
            Size = UDim2.new(1, 0, 0, 20),
            LayoutOrder = #self.Columns[1].Elements,
        })

        if style == "box" then
            sectionFrame.Size = UDim2.new(1, 0, 0, 30)
            sectionFrame.BackgroundColor3 = Utility.Colors.BackgroundLight
            sectionFrame.BorderColor3 = Utility.Colors.Border
            sectionFrame.BorderSizePixel = 1
            Utility:Create("UICorner", {Parent = sectionFrame, CornerRadius = UDim.new(0, 4)})
        end

        local sectionLabel = Utility:Create("TextLabel", {
            Name = "SectionLabel",
            Parent = sectionFrame,
            BackgroundTransparency = 1,
            Size = UDim2.new(1, -10, 1, 0),
            Position = style == "box" and UDim2.new(0, 10, 0, 0) or UDim2.new(0, 0, 0, 0),
            Text = text,
            TextColor3 = Utility.Colors.Accent,
            Font = Enum.Font.GothamBold,
            TextSize = 13,
            TextXAlignment = Enum.TextXAlignment.Left,
            TextYAlignment = Enum.TextYAlignment.Center,
        })

        if style == "line" or style == "default" then
            local line = Utility:Create("Frame", {
                Name = "SectionLine",
                Parent = sectionFrame,
                BackgroundColor3 = Utility.Colors.Border,
                BorderSizePixel = 0,
                Position = UDim2.new(0, 0, 1, -1),
                Size = UDim2.new(1, 0, 0, 1),
            })
        end

        local sectionData = {
            Frame = sectionFrame,
            Label = sectionLabel,
        }

        function sectionData:SetText(newText)
            sectionLabel.Text = newText
        end

        function sectionData:SetVisible(visible)
            self.Frame.Visible = visible
        end

        function sectionData:IsVisible()
            return self.Frame.Visible
        end

        return self:AddElement(sectionData)
    end

    function Tab:AddDivider(options)
        options = options or {}
        local orientation = options.Orientation or "horizontal" -- "horizontal" or "vertical"
        local padding = options.Padding or 8

        local dividerFrame = Utility:Create("Frame", {
            Name = "Divider",
            Parent = nil,
            BackgroundTransparency = 1,
            LayoutOrder = #self.Columns[1].Elements,
        })

        local divider = Utility:Create("Frame", {
            Name = "DividerLine",
            Parent = dividerFrame,
            BackgroundColor3 = Utility.Colors.Border,
            BorderSizePixel = 0,
        })

        if orientation == "vertical" then
            dividerFrame.Size = UDim2.new(0, 1, 1, 0)
            divider.Size = UDim2.new(0, 1, 1, -padding * 2)
            divider.Position = UDim2.new(0, 0, 0, padding)
        else
            dividerFrame.Size = UDim2.new(1, 0, 0, 1)
            divider.Size = UDim2.new(1, -padding * 2, 0, 1)
            divider.Position = UDim2.new(padding / dividerFrame.AbsoluteSize.X, 0, 0, 0)
        end

        local dividerData = {
            Frame = dividerFrame,
            Line = divider,
        }

        function dividerData:SetColor(color)
            divider.BackgroundColor3 = color
        end

        function dividerData:SetVisible(visible)
            self.Frame.Visible = visible
        end

        function dividerData:IsVisible()
            return self.Frame.Visible
        end

        return self:AddElement(dividerData)
    end

    function Tab:AddKeybind(options)
        options = options or {}
        local text = options.Text or "Keybind"
        local default = options.Default or Enum.KeyCode.Unknown
        local callback = options.Callback or function() end
        local mode = options.Mode or "toggle" -- "toggle", "hold", "always"

        local keybindContainer = Utility:Create("Frame", {
            Name = "Keybind_" .. text,
            Parent = nil,
            BackgroundTransparency = 1,
            Size = UDim2.new(1, 0, 0, 30),
            LayoutOrder = #self.Columns[1].Elements,
        })

        local keybindLabel = Utility:Create("TextLabel", {
            Name = "KeybindLabel",
            Parent = keybindContainer,
            BackgroundTransparency = 1,
            Size = UDim2.new(1, -80, 1, 0),
            Text = text,
            TextColor3 = Utility.Colors.Text,
            Font = Enum.Font.Gotham,
            TextSize = 13,
            TextXAlignment = Enum.TextXAlignment.Left,
        })

        local keybindBtn = Utility:Create("TextButton", {
            Name = "KeybindButton",
            Parent = keybindContainer,
            BackgroundColor3 = Utility.Colors.BackgroundLight,
            BorderColor3 = Utility.Colors.Border,
            BorderSizePixel = 1,
            Position = UDim2.new(1, -75, 0, 5),
            Size = UDim2.new(0, 70, 0, 20),
            Text = "None",
            TextColor3 = Utility.Colors.Text,
            Font = Enum.Font.Gotham,
            TextSize = 12,
            AutoButtonColor = false,
        })

        Utility:Create("UICorner", {Parent = keybindBtn, CornerRadius = UDim.new(0, 4)})

        local listening = false
        local currentKey = default

        local function updateDisplay()
            if listening then
                keybindBtn.Text = "..."
                keybindBtn.BackgroundColor3 = Utility.Colors.Accent
            else
                keybindBtn.Text = tostring(currentKey):gsub("Enum.KeyCode.", "")
                keybindBtn.BackgroundColor3 = Utility.Colors.BackgroundLight
            end
        end

        keybindBtn.MouseButton1Click:Connect(function()
            listening = true
            updateDisplay()

            local inputConn
            inputConn = UserInputService.InputBegan:Connect(function(input, gameProcessed)
                if gameProcessed then return end

                if input.UserInputType == Enum.UserInputType.Keyboard then
                    currentKey = input.KeyCode
                    listening = false
                    updateDisplay()
                    callback(currentKey, mode)
                    inputConn:Disconnect()
                elseif input.UserInputType == Enum.UserInputType.MouseButton1 then
                    -- Ignore mouse clicks
                else
                    -- For other input types, treat as cancel
                    listening = false
                    updateDisplay()
                    inputConn:Disconnect()
                end
            end)

            -- Cancel after 5 seconds
            task.delay(5, function()
                if listening then
                    listening = false
                    updateDisplay()
                    if inputConn then
                        inputConn:Disconnect()
                    end
                end
            end)
        end)

        local keybindData = {
            Frame = keybindContainer,
            Button = keybindBtn,
            Key = currentKey,
            Mode = mode,
        }

        function keybindData:GetKey()
            return self.Key
        end

        function keybindData:SetKey(keyCode)
            currentKey = keyCode
            self.Key = keyCode
            updateDisplay()
        end

        function keybindData:SetMode(newMode)
            self.Mode = newMode
        end

        function keybindData:SetVisible(visible)
            self.Frame.Visible = visible
        end

        function keybindData:IsVisible()
            return self.Frame.Visible
        end

        updateDisplay()
        return self:AddElement(keybindData)
    end

    function Tab:AddBanner(options)
        options = options or {}
        local text = options.Text or "Banner"
        local icon = options.Icon --rbxasset id
        local color = options.Color or Utility.Colors.Accent

        local bannerFrame = Utility:Create("Frame", {
            Name = "Banner_" .. text,
            Parent = nil,
            BackgroundColor3 = Utility.Colors.BackgroundLight,
            BorderColor3 = color,
            BorderSizePixel = 1,
            Size = UDim2.new(1, 0, 0, 40),
            LayoutOrder = #self.Columns[1].Elements,
        })

        Utility:Create("UICorner", {Parent = bannerFrame, CornerRadius = UDim.new(0, 6)})

        local iconLabel = nil
        if icon then
            iconLabel = Utility:Create("ImageLabel", {
                Name = "BannerIcon",
                Parent = bannerFrame,
                BackgroundTransparency = 1,
                Position = UDim2.new(0, 12, 0.5, -12),
                Size = UDim2.new(0, 24, 0, 24),
                Image = icon,
                ImageColor3 = color,
            })
        end

        local textLabel = Utility:Create("TextLabel", {
            Name = "BannerText",
            Parent = bannerFrame,
            BackgroundTransparency = 1,
            Position = icon and UDim2.new(0, 42, 0, 0) or UDim2.new(0, 12, 0, 0),
            Size = icon and UDim2.new(1, -54, 1, 0) or UDim2.new(1, -24, 1, 0),
            Text = text,
            TextColor3 = Utility.Colors.Text,
            Font = Enum.Font.GothamBold,
            TextSize = 14,
            TextXAlignment = Enum.TextXAlignment.Left,
            TextYAlignment = Enum.TextYAlignment.Center,
        })

        local bannerData = {
            Frame = bannerFrame,
            Text = textLabel,
            Icon = iconLabel,
        }

        function bannerData:SetText(newText)
            textLabel.Text = newText
        end

        function bannerData:SetColor(newColor)
            bannerFrame.BorderColor3 = newColor
            if iconLabel then
                iconLabel.ImageColor3 = newColor
            end
        end

        function bannerData:SetVisible(visible)
            self.Frame.Visible = visible
        end

        function bannerData:IsVisible()
            return self.Frame.Visible
        end

        return self:AddElement(bannerData)
    end

    return self:AddElement(sectionData)
    end

    -- =============================================
    -- WINDOW API
    -- =============================================

    local window = {}

    function window:AddTab(tabTitle)
        local tabButton = Utility:Create("TextButton", {
            Name = "TabButton_" .. tabTitle,
            Parent = tabBar,
            BackgroundColor3 = Utility.Colors.TabBackground,
            BorderSizePixel = 0,
            Size = UDim2.new(1 / math.max(#tabs + 1, 1), 0, 1, 0),
            Text = tabTitle,
            TextColor3 = Utility.Colors.Placeholder,
            Font = Enum.Font.Gotham,
            TextSize = 13,
            AutoButtonColor = false,
        })

        -- Create tab content frame
        local tabContent = Utility:Create("ScrollingFrame", {
            Name = "TabContent_" .. tabTitle,
            Parent = contentArea,
            BackgroundTransparency = 1,
            Size = UDim2.new(1, 0, 1, 0),
            Visible = false,
            ScrollBarThickness = 4,
            ScrollBarImageColor3 = Utility.Colors.ScrollBar,
            CanvasSize = UDim2.new(0, 0, 0, 0),
        })

        local tabLayout = Utility:Create("UIListLayout", {
            Parent = tabContent,
            FillDirection = Enum.FillDirection.Horizontal,
            SortOrder = Enum.SortOrder.LayoutOrder,
            Padding = UDim.new(0, 10),
        })

        local tabPadding = Utility:Create("UIPadding", {
            Parent = tabContent,
            PaddingTop = UDim.new(0, 8),
            PaddingBottom = UDim.new(0, 8),
            PaddingLeft = UDim.new(0, 8),
            PaddingRight = UDim.new(0, 8),
        })

        local tabData = {
            Name = tabTitle,
            Content = tabContent,
            Button = tabButton,
            Columns = {},
            ColumnCount = 0,
        }

        setmetatable(tabData, Tab)

        table.insert(tabs, tabData)
        table.insert(tabButtons, tabButton)

        -- Update tab button sizes
        for _, btn in ipairs(tabButtons) do
            btn.Size = UDim2.new(1 / #tabButtons, 0, 1, 0)
        end

        -- Tab button click
        tabButton.MouseButton1Click:Connect(function()
            window:SelectTab(tabTitle)
        end)

        -- Select first tab automatically
        if #tabs == 1 then
            window:SelectTab(tabTitle)
        end

        return tabData
    end

    function window:SelectTab(tabTitle)
        for _, tab in ipairs(tabs) do
            if tab.Name == tabTitle then
                tab.Content.Visible = true
                tab.Button.BackgroundColor3 = Utility.Colors.TabSelected
                tab.Button.TextColor3 = Utility.Colors.Text
                currentTab = tab
            else
                tab.Content.Visible = false
                tab.Button.BackgroundColor3 = Utility.Colors.TabBackground
                tab.Button.TextColor3 = Utility.Colors.Placeholder
            end
        end
    end

    function window:SetVisible(visible)
        mainFrame.Visible = visible
    end

    function window:IsVisible()
        return mainFrame.Visible
    end

    function window:Toggle()
        mainFrame.Visible = not mainFrame.Visible
    end

    function window:Destroy()
        screenGui:Destroy()
    end

    return window
end

return Linoria