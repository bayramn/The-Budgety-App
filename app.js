var budgetController = (function() {
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) { 
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    var calculateTotal =  function(type) {
        var sum = 0;
            data.allItems[type].forEach(function(element){
                sum = sum + element.value;
            });
            data.totals[type] = sum;
    };
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            if (data.allItems[type].length>0) {
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            } else {
                ID = 0;
            }
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            data.allItems[type].push(newItem);
            return newItem;

        },
        calculateBudget: function() {
            
            // calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if (data.totals.inc !== 0) { 
                data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
            } else {
                data.percentage = -1; 
            }
        },
        calculatePercentages: function() {

            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            })


        },
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;

        }, 
        deleteItem: function(type, id) {
            var ids;
            ids = data.allItems[type].map(function(current) {
                return current.id
            });
            index = ids.indexOf(id);
            if (index !== -1 ) {
                data.allItems[type].splice(index,1);
            }
        },
        getBudget: function() {
            return {
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                budget: data.budget,
                percentage: data.percentage,
            }
        },
        testing: function() {
            return data;
        }
    }
  
})();



var UIController = (function() {
    var DOMStrings = {
        addType: '.add__type',
        addDescription: '.add__description',
        addValue: '.add__value',
        addBtn: '.add__btn',
        addIncome: '.income__list',
        addExpenses: '.expenses__list',
        budgetIncomeValue: '.budget__income--value',
        budgetExpensesValue: '.budget__expenses--value',
        budgetValue: '.budget__value',
        budgetExpensesPercentage: '.budget__expenses--percentage',
        container: '.container',
        expensePercentageLabel: '.item__percentage',
        budgetDate: '.budget__title--month'
    }
    formatNumber = function(num, type) {
        var num, splitNum;
        // exactly 2 decimal points
        num = Math.abs(num);
        num = num.toFixed(2);
        splitNum = num.split('.');

        int = splitNum[0];
        dec = splitNum[1];

        // comma separating thousands
        if (int.length > 3) {
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3,3);
        } 
        // + or - before number
        //234123.35354
       // 234,123.36
        return (type === 'inc' ? '+ ' : '- ') + int + '.' + dec;  
    }
    var nodeListForEach = function(list, callback) {
                for (i = 0; i<list.length; i++) {
                    callback(list[i], i);
                }
            }

    return {
        getInput: function() {
            return {
                inputValueType: document.querySelector(DOMStrings.addType).value,
                inputValueDescription: document.querySelector(DOMStrings.addDescription).value,
                inputValueValue: parseFloat(document.querySelector(DOMStrings.addValue).value)
            }
        },
        addListItem: function(obj, type) {
            var html, newHtml, element;
            //1. Create html template for new item
            if (type === 'inc') {
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                element = DOMStrings.addIncome;
            } else if (type === 'exp') {
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                element = DOMStrings.addExpenses;
            }

             //2. Replace html template with data
             newHtml = html.replace('%id%',obj.id);
             newHtml = newHtml.replace('%description%',obj.description);
             newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));
            
            //3. Add to the UI element
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        deleteListItem: function(selectorType) {
            document.getElementById(selectorType).remove();

        },
        clearFields: function() {
            var fields = document.querySelectorAll(DOMStrings.addDescription + ', ' + DOMStrings.addValue);
            //fields.forEach(function(currentElement, i, y) {currentElement.value =''});
            var fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(function(element, i, arrayy){
                element.value = '';
            });
            fieldsArray[0].focus();
            
        },
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMStrings.expensePercentageLabel);

            nodeListForEach(fields, function(current, index){
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---'
                }
                
            });
        },
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp'; 
            document.querySelector(DOMStrings.budgetIncomeValue).textContent = formatNumber(obj.totalIncome,'inc');
            document.querySelector(DOMStrings.budgetExpensesValue).textContent = formatNumber(obj.totalExpenses,'exp');
            document.querySelector(DOMStrings.budgetValue).textContent = formatNumber(obj.budget,type);
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.budgetExpensesPercentage).textContent = obj.percentage;
            } else {
                document.querySelector(DOMStrings.budgetExpensesPercentage).textContent = '---'
            }
        },
        displayDate: function() {
            var now, currentYear, currentMonth;
            now = new Date();
            currentYear = now.getFullYear();
            currentMonth = now.toDateString().split(' ')[1];
            document.querySelector(DOMStrings.budgetDate).textContent = currentMonth + ' ' + currentYear;
        },
        typeChanged: function() {
            var fields = document.querySelectorAll(DOMStrings.addType + ',' + DOMStrings.addDescription + ',' + DOMStrings.addValue);
            nodeListForEach(fields, function(current){
                current.classList.toggle('red-focus');
            });
            document.querySelector(DOMStrings.addBtn).classList.toggle('red');

        },
        getDOMStrings: function() {
            return DOMStrings
        }
    }

})();


var controller = (function(budgetCtrl,UICtrl) {
    var addEventListeners = function() {
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.addBtn).addEventListener('click', ctrlAddItem );  
        document.addEventListener('keypress',function(e) {
            if (e.keyCode === 13 || event.which === 13 ) {
                ctrlAddItem(); 
            }
    
        }); 
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(DOM.addType).addEventListener('change',UICtrl.typeChanged)
    }
    var updateBudget = function() {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    }
    var updatePercentages = function() {
            var percentages;
            // 1. Calculate the percentages
            budgetCtrl.calculatePercentages();

            // 2. Read the percentages 
            percentages = budgetCtrl.getPercentages();

            // 3. Update UI with percentages
            UICtrl.displayPercentages(percentages);
    }
    var ctrlAddItem =  function() {    

        // 1. Get the field input data
        var input = UICtrl.getInput()
        console.log(input);

        if (input.inputValueDescription !== '' && !isNaN(input.inputValueValue) && input.inputValueValue>0) {

        // 2. Add the item to budget contoller
        var newItem = budgetCtrl.addItem(input.inputValueType, input.inputValueDescription, input.inputValueValue);
        //console.log(newItem);

         // 3. Add the item to UI
         UICtrl.addListItem(newItem, input.inputValueType);

         // 4. Clear the fields
         UICtrl.clearFields();

         // 5. Calculate and update the budget
         updateBudget();

         // 6. Calculate the percentages
         updatePercentages();
        }
    
        
    }
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]); //console.log(splitID, type, ID);
        }

        // 1. Delete item from Data structure
        budgetCtrl.deleteItem(type, ID);

        // 2. Delete item from UI
        UICtrl.deleteListItem(itemID);

        // 3. Update(from data) and Display the budget
        updateBudget();

        // 4. Calculate the percentages
        updatePercentages();
    } 

    return {
        init: function() {
            console.log('Application has started');
            UIController.displayDate();
            UICtrl.displayBudget({
                totalIncome: 0,
                totalExpenses: 0,
                budget: 0,
                percentage: -1,
            });
            addEventListeners();
        }
    }   
   
})(budgetController,UIController);

controller.init();