(function () {
    'use strict'
    app.component('tranferItemRelocationReserve', {
        controllerAs: '$vm',
        templateUrl: "modules/Tranfer/TransferItemRelocationReserve/component/tranferItemRelocationReserve.html",
        bindings: {
            onShow: '=?',
            searchResultModel: '=?',
            filterModel: '=?',
            triggerSearch: '=?',
            triggerCreate: '=?',
            isFilter: '=?',
            isLoading: '=?',
            isCheckBalance: '=?',
        },
        controller: function ($scope, $q, $filter, $state, pageLoading, $window, commonService, localStorageService, $timeout, dpMessageBox, ownerFactory, warehouseFactory, locationFactory, tranferFactory, TransferStockAdjustmentFactory, $rootScope) {
            var $vm = this;
            var defer = {};
            $vm.isFilter = true;
            $scope.isCheckBalance = true;
            $scope.filterModel = {};
            // let viewModelOwner = ownerFactory;
            // let viewModelWH = warehouseFactory;
            // let viewModelLocation = locationFactory;
            let viewModelTransfer = tranferFactory;
            var viewModel = TransferStockAdjustmentFactory;

            $rootScope.$on('$routeChangeSuccess', function () {
                console.log("route changed");
                debugger;
            });

            $scope.ScanTagNoBarcode = function () {
                $scope.filterModel = $scope.filterModel || {};
                $scope.filterModel.productConversionBarcode = '';
                $scope.filterModel.productId = '';
                $scope.filterModel.productName = '';
                $scope.filterModel.qty = '';
                $scope.filterModel.productConversionName = '';
                $scope.filterModel.tagNoNew = '';
                $vm.filterModel.locationName = '';

                if ($scope.filterModel.lpnNo != "" && $scope.filterModel.lpnNo != undefined) {
                    pageLoading.show();
                    viewModelTransfer.scanTagNoReserve($scope.filterModel).then(function success(res) {
                        pageLoading.hide();
                        if (res.data.checkSearchLPN.length > 0) {

                            if (res.data.formart[0].tag_No == "false") {
                                dpMessageBox.alert({
                                    ok: 'Yes',
                                    title: 'Information.',
                                    message: "กรุณาตรวจสอบ Format LPN"
                                })
                            }
                            else if (res.data.itemsLPN.length > 0) {
                                $scope.filterModel.create_By = $scope.userName;
                                $scope.filterModel.update_By = $scope.userName;
                                $scope.checkLocationBalance();
                            }
                            else {
                                $vm.searchResultModel = null
                                $vm.filterModel.locationName = "";
                                if ($vm.searchBarcode != undefined) {
                                    $vm.searchBarcode = undefined
                                }
                                dpMessageBox.alert({
                                    ok: 'Close',
                                    title: 'Information.',
                                    message: "Barcode LPN :" + $scope.filterModel.lpnNo + " นี้ไม่มีสินค้าในระบบ !"
                                })
                                document.getElementById("focusScanLPN").focus();
                                document.getElementById("focusScanLPN").select();
                            }
                        }
                        else {
                            $vm.searchResultModel = null
                            $vm.filterModel.locationName = "";
                            if ($vm.searchBarcode != undefined) {
                                $vm.searchBarcode = undefined
                            }
                            dpMessageBox.alert({
                                ok: 'Close',
                                title: 'Information.',
                                message: " ไม่พบ BarcodeLPN ที่ค้นหา กรุณาสแกนอีกครั้ง !"
                            })

                            document.getElementById("focusScanLPN").focus();
                            document.getElementById("focusScanLPN").select();
                        }
                    },
                        function error(res) {

                        });
                }
                else {
                    dpMessageBox.alert({
                        ok: 'Close',
                        title: 'Information.',
                        message: " Barcode LPN ต้องไม่เป็นค่าว่าง !"
                    })
                }

            }

            $scope.checkLocationBalance = function () {
                pageLoading.show();
                viewModelTransfer.CheckBinBalance($scope.filterModel).then(function success(res) {
                    pageLoading.hide();
                    if (res.data.itemsLPN.length > 0) {
                        $vm.searchResultModel = res.data.itemsLPN;
                        $vm.filterModels = res.data.itemsLPN;
                        $scope.filterModel.locationId = res.data.itemsLPN[0].locationId;
                        $scope.filterModel.locationIndex = res.data.itemsLPN[0].locationIndex;
                        $scope.filterModel.locationName = res.data.itemsLPN[0].locationName;
                        $vm.filterModel.locationName = res.data.itemsLPN[0].locationName;
                        $scope.filterModel.ProductId = res.data.itemsLPN[0].productId;
                        $scope.filterModel.ProductName = res.data.itemsLPN[0].productName;
                        //$scope.filterModel.qty = res.data.itemsLPN[0].qty;
                        $scope.filterModel.create_By = $scope.userName;
                        $scope.filterModel.update_By = $scope.userName;
                        if ($vm.searchBarcode != undefined) {
                            $vm.searchBarcode = undefined
                        }
                        $scope.SumQty($scope.filterModel);
                    }
                    // else {
                    //     dpMessageBox.alert({
                    //         ok: 'Close',
                    //         title: 'Information.',
                    //         message: "Barcode LPN :" + $scope.filterModel.lpnNo + " นี้ไม่มีสินค้าในระบบ !"
                    //     })
                    //     document.getElementById("focusScanLPN").focus();
                    //     document.getElementById("focusScanLPN").select();
                    // }
                },
                    function error(res) {

                    });
            }
            $scope.SumQty = function (model) {
                var deferred = $q.defer();
                viewModelTransfer.SumQty(model).then(
                    function success(res) {
                        $scope.sumLoc = res.data.sumQtyLoc;
                        $scope.sumLPN = res.data.sumQtyLPN;
                        deferred.resolve(res);
                    },
                    function error(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            }
            $scope.confirm = function () {
                let models = $scope.filterModel;
                validate(models).then(function (result) {
                    if (result) {
                        $scope.validateMsg = result;
                        dpMessageBox.alert(
                            {
                                ok: 'Close',
                                title: 'Validate',
                                message: result
                            }
                        )
                    }
                    else {

                        if ($scope.filterModel.productId != undefined && $scope.filterModel.productId != "" && $scope.filterModel.productName != undefined && $scope.filterModel.productName != "") {
                            if ($scope.filterModel.lpnNo != $scope.filterModel.tagNoNew) {
                                if ($scope.isScanTag != 1) {
                                    let models = $scope.filterModel.listTransferItemViewModel;

                                    for (var i = 0; i <= models.listTransferItemViewModel.length - 1; i++) {
                                        models.listTransferItemViewModel[i].tagNoNew = $scope.filterModel.tagNoNew;
                                        if ($scope.filterModel.qty != models.listTransferItemViewModel[i].binBalanceQtyBal) {
                                            models.listTransferItemViewModel[i].binBalanceQtyBal = $scope.filterModel.qty;
                                            models.listTransferItemViewModel[i].totalQty = $scope.filterModel.qty;
                                        }
                                    }
                                    dpMessageBox.confirm({
                                        ok: 'Yes',
                                        cancel: 'No',
                                        title: 'Confirm ?',
                                        message: 'Do you want to Save !'
                                    }).then(function () {
                                        pageLoading.show();
                                        viewModelTransfer.Save(models).then(function success(res) {
                                            pageLoading.hide();
                                            if (res.data == true) {
                                                dpMessageBox.alert({
                                                    ok: 'Close',
                                                    title: 'Information.',
                                                    message: " Complete !!!"
                                                })
                                                init();
                                            }
                                            else {
                                                dpMessageBox.alert({
                                                    ok: 'Close',
                                                    title: 'Information.',
                                                    message: " Qty ในสต๊อกเกิน ไม่สามารถ Tranfer ได้กรุณาลองใหม่ !!!"
                                                })
                                                init();
                                            }
                                        }, function error(param) {
                                            dpMessageBox.alert(param).then(function (param) { }, function (param) { });
                                        });
                                    });
                                }
                                else {
                                    dpMessageBox.alert({
                                        ok: 'Yes',
                                        title: 'Information.',
                                        message: " ไม่สามารถทำได้ LPN:" + " " + $scope.filterModel.tagNoNew + " " + " นี้มีการใช้งานอยู่ !"
                                    })
                                    $scope.filterModel.tagNoNew = "";
                                }
                            }
                            else {
                                dpMessageBox.alert({
                                    ok: 'Yes',
                                    title: 'Information.',
                                    message: "ไม่สามารถโอนสินค้าไปยัง LPN เดิมได้ !"
                                })
                                $scope.filterModel.tagNoNew = "";
                            }
                        }
                        else {
                            dpMessageBox.alert({
                                ok: 'Close',
                                title: 'Information.',
                                message: " คุณยังไม่ได้เลือกสินค้า เลือกสินค้าก่อน จะกด Confirm !"
                            })
                        }

                    }
                })

            }
            $scope.popupOwner = {
                onShow: false,
                delegates: {},
                onClick: function (param, index) {
                    $scope.popupOwner.onShow = !$scope.popupOwner.onShow;
                    $scope.popupOwner.delegates.ownerPopup(param, index);
                },
                config: {
                    title: "owner"
                },
                invokes: {
                    add: function (param) { },
                    edit: function (param) { },
                    selected: function (param) {
                        $scope.filterModel.ownerIndex = angular.copy(param.ownerIndex);
                        $scope.filterModel.ownerId = angular.copy(param.ownerId);
                        $scope.filterModel.ownerName = angular.copy(param.ownerName);

                        localStorageService.set('ownerVariableId', angular.copy(param.ownerId));
                        localStorageService.set('ownerVariableIndex', angular.copy(param.ownerIndex));
                        localStorageService.set('ownerVariableName', angular.copy(param.ownerName));
                    }
                }
            };

            $scope.popupWarehouse = {
                onShow: false,
                delegates: {},
                onClick: function (param, index) {
                    $scope.popupWarehouse.onShow = !$scope.popupWarehouse.onShow;
                    $scope.popupWarehouse.delegates.warehousePopup(param, index);
                },
                config: {
                    title: "Warehouse"
                },
                invokes: {
                    add: function (param) { },
                    edit: function (param) { },
                    selected: function (param) {
                        $scope.filterModel.warehouseIndex = angular.copy(param.warehouseIndex);
                        $scope.filterModel.warehouseId = angular.copy(param.warehouseId);
                        $scope.filterModel.warehouseName = angular.copy(param.warehouseName);

                        localStorageService.set('warehouseVariableId', angular.copy(param.warehouseId));
                        localStorageService.set('warehouseVariableIndex', angular.copy(param.warehouseIndex));
                        localStorageService.set('warehouseVariableName', angular.copy(param.warehouseName));
                    }
                }
            };


            $scope.filter = function () {
                $scope.filterModel = $scope.filterModel || {};
                pageLoading.show();
                // $scope.filterowner($scope.filterModel).then(function success(res) {
                //     pageLoading.hide();
                //     $scope.filterModel.ownerIndex = res.data[0].ownerIndex;
                //     $scope.filterModel.ownerId = res.data[0].ownerId;
                //     $scope.filterModel.ownerName = res.data[0].ownerName;
                //     $scope.filterWarehouse($scope.filterModel).then(function success(res) {
                //         $scope.filterModel.warehouseIndex = res.data[0].warehouseIndex
                //         $scope.filterModel.warehouseName = res.data[0].warehouseName;
                //         setTimeout(() => {
                //             var focusElem = jQuery('input[ng-model="filterModel.lpnNo"]');
                //             if (focusElem[0].focus != undefined) {
                //                 focusElem[0].focus();

                //             }

                //         }, 200);
                //     });
                // }, function error(res) { });
            }

            $scope.filterowner = function (model) {
                var deferred = $q.defer();
                pageLoading.show();
                viewModel.filterowner().then(
                    function success(res) {
                        deferred.resolve(res);
                        pageLoading.hide(1000);
                    },
                    function error(response) {
                        deferred.reject(response);
                        pageLoading.hide(1000);
                    });
                return deferred.promise;
            }

            $scope.filterWarehouse = function (model) {
                var deferred = $q.defer();
                pageLoading.show();
                viewModel.filterWarehouse(model).then(
                    function success(res) {
                        deferred.resolve(res);
                        pageLoading.hide(1000);
                    },
                    function error(response) {
                        deferred.reject(response);
                        pageLoading.hide(1000);
                    });
                return deferred.promise;
            }



            $scope.ScanTagNo = function (param) {
                let models = $scope.filterModel;
                validate(models).then(function (result) {
                    if (result) {
                        $scope.validateMsg = result;
                        dpMessageBox.alert(
                            {
                                ok: 'Close',
                                title: 'Validate',
                                message: result
                            }
                        )
                    }
                    else {
                        if ($scope.filterModel.lpnNo != $scope.filterModel.tagNoNew) {
                            if ($scope.filterModel.productId != undefined && $scope.filterModel.productId != "" && $scope.filterModel.productName != undefined && $scope.filterModel.productName != "") {
                                let models = $scope.filterModel.listTransferItemViewModel;
                                if ($scope.filterModel.tagNoNew != undefined) {
                                    for (var i = 0; i <= models.listTransferItemViewModel.length - 1; i++) {
                                        models.listTransferItemViewModel[i].tagNoNew = $scope.filterModel.tagNoNew;
                                        models.listTransferItemViewModel[i].warehouseIndex = $scope.filterModel.warehouseIndex;
                                    }
                                }
                                viewModelTransfer.scanTagNo(models).then(function success(res) {
                                    if (res.data.itemsCheckTagNo.length > 0) {
                                        $scope.isScanTag = 0;
                                        $scope.confirm();
                                        // dpMessageBox.alert({
                                        //     ok: 'Yes',
                                        //     title: 'Information.',
                                        //     message: "LPN:" + " " + $scope.filterModel.tagNoNew + " " + " ยืนยันเพื่อสร้าง LPN !"
                                        // })


                                        //$vm.searchResultModel = res.data;
                                        // $scope.confirm();
                                    }
                                    else if (res.data.itemsCheckTagNoQtyNotZero.length > 0) {
                                        dpMessageBox.alert({
                                            ok: 'Yes',
                                            title: 'Information.',
                                            message: " ไม่สามารถทำได้ LPN:" + " " + $scope.filterModel.tagNoNew + " " + " นี้มีการใช้งานอยู่ !"
                                        })
                                        $scope.filterModel.tagNoNew = "";
                                        $scope.isScanTag = 1;
                                    }
                                    else {
                                        $scope.isScanTag = 0;
                                        $scope.confirm();
                                        // dpMessageBox.alert({
                                        //     ok: 'Yes',
                                        //     title: 'Information.',
                                        //     message: "LPN:" + " " + $scope.filterModel.tagNoNew + " " + " ยังไม่มีในระบบ ยืนยันเพื่อสร้าง LPN ใหม่ !"
                                        // })
                                    }
                                },
                                    function error(res) {
                                    });
                            }
                            else {
                                dpMessageBox.alert({
                                    ok: 'Close',
                                    title: 'Information.',
                                    message: " คุณยังไม่ได้เลือกสินค้า เลือกสินค้าก่อน จะกด Confirm !"
                                })
                            }
                        }
                        else {
                            dpMessageBox.alert({
                                ok: 'Yes',
                                title: 'Information.',
                                message: "ไม่สามารถโอนสินค้าไปยัง LPN เดิมได้ !"
                            })
                            $scope.filterModel.tagNoNew = "";
                        }
                    }
                })

            }

            function validate(param) {
                let defer = $q.defer();
                let msg = "";
                if (param.lpnNo == null || param.lpnNo == "") {
                    msg = ' Barcode LPN ต้องไม่เป็นค่าว่าง !'
                    defer.resolve(msg);
                }
                else if (param.tagNoNew == null || param.tagNoNew == "") {
                    msg = ' Barcode LPN ปลายทาง ต้องไม่เป็นค่าว่าง !'
                    defer.resolve(msg);
                }
                defer.resolve(msg);

                return defer.promise;
            }


            $scope.ScanProductBarcode = function () {
                if ($scope.filterModel.locationName != undefined) {
                    viewModelTransfer.CheckBinBalance($scope.filterModel).then(function success(res) {
                        if (res.data.itemsLPN.length > 0) {
                            if (res.data.itemsLPN[0].tag_No != null) {
                                //$vm.searchResultModel = res.data.itemsLPN;
                                $vm.searchBarcode = res.data.itemsLPN;
                                $vm.filterModel.productId = res.data.itemsLPN[0].productId;
                                $vm.filterModel.productName = res.data.itemsLPN[0].productName;
                                $vm.filterModel.qty = res.data.itemsLPN[0].qty;
                                $vm.filterModel.create_By = $scope.userName;
                                $vm.filterModel.update_By = $scope.userName;
                                $scope.filterModel.productId = "";
                                $scope.filterModel.productName = "";
                                $scope.filterModel.qty = "";
                                $scope.filterModel.productConversionName = "";
                            }
                            else {
                                init();
                                dpMessageBox.alert({
                                    ok: 'Close',
                                    title: 'Information.',
                                    message: "ProductBarcode Not Found !!!"
                                })
                            }
                            // $vm.searchResultModel = res.data;
                            // $vm.filterModel.productId = res.data[0].productId;
                            // $vm.filterModel.productName = res.data[0].productName;
                            // $vm.filterModel.qty = res.data[0].qty;
                            // $vm.filterModel.create_By = $scope.userName;
                        }
                    },
                        function error(res) {

                        });
                }
                else {
                    dpMessageBox.alert({
                        ok: 'Yes',
                        title: 'Information.',
                        message: "Please Scan Barcode LPN !"
                    })
                }

            }
            $vm.tagNolist = function () {

                var datalist = $scope.filterModel;
                var sumLPN = $scope.sumLPN;
                $vm.isFilter = false;
                if ($scope.isCheckBalance) {
                    $vm.isCheckBalance(datalist, sumLPN).then(function (result) {
                        $vm.isFilter = true;
                        $vm.isLoading = true;
                    })
                }

            }
            $vm.locationlist = function () {
                if ($vm.filterModel.locationName != undefined) {
                    if ($scope.isLoading) {
                        $vm.isFilter = false;
                        var datalist = $vm.searchResultModel;
                        if ($vm.searchBarcode != undefined) {
                            datalist = $vm.searchBarcode;
                        }
                        //var sumLoc = $scope.sumLoc;
                        var sumLPN = $scope.sumLPN;
                        var newItems = $vm.filterModel;
                        var searchBarcode = $vm.searchBarcode;
                        $scope.isLoading(datalist, searchBarcode, sumLPN, newItems).then(function (result) {
                            $vm.isFilter = true;
                            //let DataList = $vm.searchResultModel;
                            //let itemsAll = $vm.filterModels;
                            let param = "";
                            if (result == 'false') {
                                $scope.filterModel.productConversionBarcode = "";
                                $scope.filterModel.productId = "";
                                $scope.filterModel.productName = "";
                                $scope.filterModel.qty = "";
                                $scope.filterModel.productConversionName = "";
                                $vm.searchBarcode = undefined
                            }
                            else {
                                if (datalist != null) {
                                    var Activity = [];
                                    let newItem = {};
                                    if (result.data.length > 0) {
                                        newItem.emtry = 2;
                                        newItem.create_By = $scope.filterModel.create_By;
                                        newItem.update_By = $scope.filterModel.update_By;
                                        newItem.warehouseId = $scope.filterModel.warehouseId;
                                        newItem.warehouseIndex = $scope.filterModel.warehouseIndex;
                                        newItem.warehouseName = $scope.filterModel.warehouseName;
                                        newItem.ownerId = $scope.filterModel.ownerId;
                                        newItem.ownerIndex = $scope.filterModel.ownerIndex;
                                        newItem.ownerName = $scope.filterModel.ownerName;
                                        newItem.lpnNo = $scope.filterModel.lpnNo;

                                        newItem.goodsReceiveIndex = result.data[0].goodsReceiveIndex;
                                        newItem.goodsReceiveItemIndex = result.data[0].goodsReceiveItemIndex;
                                        newItem.itemStatusId = result.data[0].itemStatusId;
                                        newItem.ItemStatusIndex_From = result.data[0].itemStatusIndex;
                                        newItem.itemStatusName_From = result.data[0].itemStatusName_From;
                                        newItem.exp_Date = result.data[0].exP_Date;
                                        newItem.mfg_Date = result.data[0].mfG_Date;
                                        newItem.locationIndex = result.data[0].locationIndex;
                                        newItem.locationId = result.data[0].locationId;
                                        newItem.locationName = result.data[0].locationName;
                                        newItem.productConversionId = result.data[0].productConversionId;
                                        newItem.productConversionIndex = result.data[0].productConversionIndex;
                                        newItem.productConversionName = result.data[0].productConversionName;

                                        newItem.binBalance_Index = result.data[0].binBalance_Index;
                                        newItem.productLot = result.data[0].productLot;
                                        newItem.qty = result.data[0].binBalanceQtyBal;
                                        newItem.totalQty = result.data[0].binBalanceQtyBal;
                                        newItem.binBalanceRatio = result.data[0].binBalanceRatio;
                                        newItem.binBalanceQtyReserve = result.data[0].binBalanceQtyReserve;
                                        newItem.binBalanceVolumeBal = result.data[0].binBalanceVolumeBal;
                                        newItem.binBalanceWeightBal = result.data[0].binBalanceWeightBal;
                                        newItem.tag_Status = result.data[0].tag_Status;
                                        newItem.tagNoFrom = result.data[0].tag_No;
                                        newItem.tag_Index_From = result.data[0].tag_Index;
                                        newItem.productIndex = result.data[0].productIndex;
                                        newItem.productId = result.data[0].productId;
                                        newItem.productName = result.data[0].productName;
                                        newItem.productSecondName = result.data[0].productSecondName;
                                        newItem.productThirdName = result.data[0].productThirdName;
                                        newItem.MFG_Date = result.data[0].MFG_Date;
                                        newItem.EXP_Date = result.data[0].EXP_Date;

                                        $scope.filterModel.productId = result.data[0].productId;
                                        $scope.filterModel.productName = result.data[0].productName;
                                        $scope.filterModel.qty = result.data[0].binBalanceQtyBal;

                                        $scope.filterModel.productConversionName = result.data[0].productConversionName;

                                    }
                                    if (newItem.emtry == 2) {
                                        Activity.push(newItem);
                                    }

                                }
                                if (Activity) {
                                    param = Activity;
                                }
                                let dataList = {
                                    listTransferItemViewModel: param
                                }
                                $scope.filterModel.listTransferItemViewModel = dataList;
                                setTimeout(() => {
                                    var focusElem = jQuery('input[ng-model="filterModel.tagNoNew"]');
                                    if (focusElem[0].focus != undefined) {
                                        focusElem[0].focus();

                                    }

                                }, 200);
                            }

                        }).catch(function (error) {

                        });
                    }
                }
                else {
                    dpMessageBox.alert({
                        ok: 'Yes',
                        title: 'Information.',
                        message: "Please BarcodeLoction !"
                    })
                }
            }

            $scope.clearSearch = function (param) {
                // $scope.filterModel = {};
                // $state.reload();
                // $window.scrollTo(0, 0);
                init();
            }

            $vm.barcodelpn = function () {
                if ($scope.checkBalance) {
                    $vm.isFilter = false;
                    $scope.checkBalance().then(function (result) {
                        $vm.isFilter = true;
                    }).catch(function (error) {
                        defer.reject({ 'Message': error });
                    });
                }
            }

            var init = function () {
                $scope.userName = localStorageService.get('userTokenStorage');
                $scope.filterModel = {};
                $vm.filterModel.locationName = "";
                $scope.filter();

                $scope.filterModel.ownerId = localStorageService.get('ownerVariableId');
                $scope.filterModel.ownerIndex = localStorageService.get('ownerVariableIndex');
                $scope.filterModel.ownerName = localStorageService.get('ownerVariableName');
                $scope.filterModel.ownerNameTemp = localStorageService.get('ownerVariableName');
                
                $scope.filterModel.warehouseId = localStorageService.get('warehouseVariableId');
                $scope.filterModel.warehouseIndex = localStorageService.get('warehouseVariableIndex');
                $scope.filterModel.warehouseName = localStorageService.get('warehouseVariableName');
                $scope.filterModel.warehouseNameTemp = localStorageService.get('warehouseVariableName');
            };
            init();
        }
    })
})();