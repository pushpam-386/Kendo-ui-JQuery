$(document).ready(function () {

    $("#err").hide()
    $("#start , #end").kendoDatePicker({
        // defines the start view
        start: "year",

        // defines when the calendar should return date
        depth: "year",

        // display month and year in the input
        format: "MMMM yyyy",

        // specifies that DateInput is used for masking the input element
        dateInput: false,
    });

})

function getUnitsInStockClass(units) {
    // console.log(units);
    if (units < 30) {
        return "";
    } else if (units < 60) {
        return "critical";
    } else if (units < 90) {
        return "warning";
    } else {
        return "ok";
    }
}


$(document).ready(function () {

    $("#err").hide()
    $("#start , #end").kendoDatePicker({
        // defines the start view
        start: "year",

        // defines when the calendar should return date
        depth: "year",

        // display month and year in the input
        format: "MMMM yyyy",

        // specifies that DateInput is used for masking the input element
        dateInput: true,
    });



    var StartDate;
    var EndDate;

    byDefault();

    function byDefault() {
        $('#grid').html('')
        $("#grid").show()
        var iniStartDate = document.getElementById('start').value;
        var StartMonth = iniStartDate.split(" ")[0]
        var iniEndDate = document.getElementById('end').value;
        var EndMonth = iniEndDate.split(" ")[0]

        //console.log(new Date(`${StartMonth} 1, ${iniStartDate.split(" ")[1]}`).getMonth() + 1)
        StartMonth = new Date(`${StartMonth} 1, ${iniStartDate.split(" ")[1]}`).getMonth() + 1;

        //console.log(new Date(`${EndMonth} 1, ${iniEndDate.split(" ")[1]}`).getMonth() + 1)
        EndMonth = new Date(`${EndMonth} 1, ${iniEndDate.split(" ")[1]}`).getMonth() + 1;

        var StartYear = iniStartDate.split(" ")[1]
        StartDate = StartMonth + "%20" + StartYear
        var EndYear = iniEndDate.split(" ")[1]
        EndDate = EndMonth + "%20" + EndYear

        //console.log(StartDate)
        //console.log(EndDate)

        function err() {
            $("#grid").hide()
            $('#err').show()
        }

        if ((StartYear > EndYear) || ((StartYear == EndYear) && (StartMonth > EndMonth))) {
            return err()

        } else {
            urlLoading(StartDate, EndDate)
            $("#grid").LoadingOverlay("show")

        }
    }


    $("#btn1").on("click", function () {

        $('#grid').html('')
        $("#grid").show()
        var iniStartDate = document.getElementById('start').value;
        var StartMonth = iniStartDate.split(" ")[0]
        var iniEndDate = document.getElementById('end').value;
        var EndMonth = iniEndDate.split(" ")[0]

        //console.log(new Date(`${StartMonth} 1, ${iniStartDate.split(" ")[1]}`).getMonth() + 1)
        StartMonth = new Date(`${StartMonth} 1, ${iniStartDate.split(" ")[1]}`).getMonth() + 1;

        EndMonth = new Date(`${EndMonth} 1, ${iniEndDate.split(" ")[1]}`).getMonth() + 1;
        //console.log(new Date(`${EndMonth} 1, ${iniEndDate.split(" ")[1]}`).getMonth() + 1)

        var StartYear = iniStartDate.split(" ")[1]
        StartDate = StartMonth + "%20" + StartYear
        var EndYear = iniEndDate.split(" ")[1]
        //console.log(EndYear);
        EndDate = EndMonth + "%20" + EndYear

        function err() {
            $("#grid").hide()
            $('#err').show()
        }

        if ((StartYear > EndYear) || ((StartYear == EndYear) && (StartMonth > EndMonth))) {
            return err()

        } else {
            urlLoading(StartDate, EndDate)
            $("#grid").LoadingOverlay("show")

        }

    });


    function urlLoading(StartDate, EndDate) {

        var myURL = 'https://appcgdev.azurewebsites.net/api/AllocationTimePhasewithEmpty/eb9b10e7-4475-ed11-b0d0-00155daccb42' + '/' + StartDate + '/' + EndDate;

        $.ajax({
            url: myURL,
            type: 'GET',
            success: function (data) {
                $("#grid").LoadingOverlay("hide")
                var result = JSON.parse(data)
                dataRender(result);
            }
        });
    }

    function dataRender(result) {
        console.log(result);
        var Demo = result[1]
        var mykeys = Object.keys(Demo)
        console.log(mykeys)
        var keys = [];

        for (var i = 12; i < mykeys.length; i++) {
            if (mykeys[i].indexOf('_Status') == -1) {
                keys.push(mykeys[i])
            }
        }
        console.log(keys);

        var gridValue = [];
        var obj = {};
        var arr = [];

        for (let i = 0; i < keys.length; i++) {
            arr.push({
                field: keys[i],
                width: 65,
                title: `${keys[i].split("_")[0]}`
            });
        }
        
        const yearField = keys[0].split("_")[1] + "-" + keys[keys.length-1].split("_")[1];
        obj = { title: yearField, columns: arr };

        gridValue.push(obj);

        console.log(obj.title);

        var grid = $("#grid").kendoGrid({
            dataSource: { data: result },
            height: 500,
            sortable: true,
            resizable: true,
            editable: 'inline',

            pageable: {
                refresh: true,
                pageSizes: true,
            },
            columns: [
            {
                field: "Resourcename", title: "Employee Name", width: 185, 

            }, { title: "Deletion", command: "destroy", width: 100 },
            
            {
                columns: gridValue
            },
            ],

            dataBound: function (e) {

                $("#grid").data("kendoGantt");
                for (var i = 2; i < keys.length + 3; i++) {
                    // get the index of the UnitsInStock cell
                    var columns = e.sender.columns;
                    var columnIndex = i;
                    // iterate the table rows and apply custom cell styling
                    var rows = e.sender.tbody.children();
                    for (var j = 0; j < rows.length; j++) {
                        var row = $(rows[j]);
                        var dataItem = e.sender.dataItem(row);
                        var units = dataItem.get(`${keys[i - 2]}`);

                        var cell = row.children().eq(columnIndex);
                        cell.addClass(getUnitsInStockClass(units));
                    }
                }
            }
        });
    } 
});
