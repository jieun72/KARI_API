export default {
    url : "http://172.30.1.52:8086",
    token : "Qw1g540uNLIKrADOK5R5gHFaZM0-82frYAC55toCBC9-lUPK6tcLl11if61F6B3BarUtjXrWZcd5gIxW_1Hi8Q==",
    org : "KARI",
    bucket : "NGOS",
    awsTypes : [ "t_hmp_Avg", "rh_hmp_Avg", "BP_Avg", "WinSpd_S_WVT", "WinDir_D1_WVT" ],
    cs451Types : [ "Lvl_cm_Avg", "Lvl_cm_Max", "Lvl_cm_Min", "Lvl_cm_TMx", "Lvl_cm_TMn", "Temp_C_Max", "Temp_C_Min", "Temp_C_TMx", "Temp_C_TMn" ],
    cs451UNIXTypes : [ "Lvl_cm_TMx", "Lvl_cm_TMn", "Temp_C_TMx", "Temp_C_TMn" ],
    cs451LevelTypes: [ "Lvl_cm_Avg", "Lvl_cm_Max", "Lvl_cm_Min", "Lvl_cm_TMx", "Lvl_cm_TMn" ],
    cs451TempTypes : [ "Temp_C_Max", "Temp_C_Min", "Temp_C_TMx", "Temp_C_TMn" ],
    li191Types : [ "LineQ1_Avg", "LineQ2_Avg" ],
    si111Types : [ "IRT1_TargetTC_Avg", "IRT2_TargetTC_Avg" ],
    crn4Types : [ "CM3Up_Avg", "CM3Dn_Avg", "CG3UpCo_Avg", "CG3DnCo_Avg" ],
    floxTypes : [ "REF_FULL", "REF_FLUO", "INDEX" ],
    floxAllTypes : [ "SIF_ALL", "SIF_A_ifld", "SIF_A_SVD", "SIF_A_sfm", "SIF_B_ifld", "SIF_B_SVD", "SIF_B_sfm", "PAR_inc", "R", "G", "B", "NIR" ],
    floxTypesIndex : [ "SIF_A_ifld", "SIF_A_SVD", "SIF_A_sfm", "SIF_B_ifld", "SIF_B_SVD", "SIF_B_sfm", "PAR_inc" ],
    pom02Types : [ "AOT", "wl_1", "wl_2", "wl_3", "wl_4", "wl_5", "wl_6", "wl_7", "wl_8", "wl_9", "wl_10", "wl_11", "Oze", "PWV" ],
    eddyproTypes : [ "wind_dir", "Tau", "H", "LE", "co2_flux", "h2o_flux" ],
    collectionTypes : [ "Ms700", "aws", "cs451", "hfp01", "li191", "si111", "crn4", "flox", "pom02", "eddypro" ]
};